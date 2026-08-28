import { Module, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Controller, Get, Patch, Post, Body, Param } from '@nestjs/common';
import { IsInt, Min, Max, IsArray, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '../../common/enums/tournament-status.enum';
import { SupabaseService } from '../supabase/supabase.service';

export class SetScoreDto {
  @IsInt()
  @Min(1)
  @Max(5)
  setNumber: number;

  @IsInt()
  @Min(0)
  @Max(35)
  team1Score: number;

  @IsInt()
  @Min(0)
  @Max(35)
  team2Score: number;
}

export class UpdateMatchScoreDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetScoreDto)
  @IsNotEmpty()
  setScores: SetScoreDto[];

  @IsOptional()
  winnerId?: string;

  @IsOptional()
  status?: MatchStatus;
}

export interface SetResult {
  setNumber: number;
  team1Score: number;
  team2Score: number;
  winnerTeamId?: string;
}

export interface MatchEntity {
  id: string;
  tournamentId: string;
  stage?: string;
  groupName?: string;
  roundNumber: number;
  matchOrder: number;
  roundName?: string;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  court?: string;
  scheduledTime?: string;
  setScores: SetResult[];
  status: MatchStatus;
  nextMatchId: string | null;
  nextMatchSlot: number | null;
}

@Injectable()
export class MatchesService {
  private inMemoryMatches: Map<string, MatchEntity> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  private determineSetWinner(
    set: SetScoreDto,
    team1Id: string,
    team2Id: string,
    pointsToWin = 21,
    maxPointsCap = 30,
  ): string | null {
    const { team1Score, team2Score } = set;
    if (team1Score >= maxPointsCap) return team1Id;
    if (team2Score >= maxPointsCap) return team2Id;
    if (team1Score >= pointsToWin && team1Score - team2Score >= 2) return team1Id;
    if (team2Score >= pointsToWin && team2Score - team1Score >= 2) return team2Id;
    return null;
  }

  async updateScore(
    matchId: string,
    dto: UpdateMatchScoreDto,
    tournamentRules = { maxSets: 3, pointsToWinSet: 21, maxPointsCap: 30 },
  ) {
    const supabase = this.supabaseService.getClient();

    let match: MatchEntity;
    if (supabase) {
      const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).single();
      if (error || !data) throw new NotFoundException(`Trận đấu #${matchId} không tồn tại`);
      match = {
        id: data.id,
        tournamentId: data.tournament_id,
        stage: data.stage,
        groupName: data.group_name,
        roundNumber: data.round_number,
        matchOrder: data.match_order,
        roundName: data.round_name,
        team1Id: data.team1_id,
        team2Id: data.team2_id,
        winnerId: data.winner_id,
        court: data.court,
        scheduledTime: data.scheduled_time,
        setScores: data.set_scores || [],
        status: data.status,
        nextMatchId: data.next_match_id,
        nextMatchSlot: data.next_match_slot,
      };

      // Tải quy tắc giải đấu trực tiếp từ bảng tournaments
      try {
        const { data: tourney } = await supabase.from('tournaments').select('*').eq('id', match.tournamentId).single();
        if (tourney) {
          tournamentRules = {
            maxSets: Number(tourney.max_sets || tourney.maxSets || 3),
            pointsToWinSet: Number(tourney.points_to_win_set || tourney.pointsToWinSet || 21),
            maxPointsCap: Number(tourney.max_points_cap || tourney.maxPointsCap || 30),
          };
        }
      } catch (err) {
        // Fallback to defaults
      }
    } else {
      const found = this.inMemoryMatches.get(matchId);
      if (!found) throw new NotFoundException(`Trận đấu #${matchId} không tồn tại`);
      match = found;
    }

    if (!match.team1Id || !match.team2Id) {
      throw new BadRequestException('Trận đấu chưa đủ 2 đội tham gia');
    }

    const setsToWinMatch = Math.ceil(tournamentRules.maxSets / 2);
    let team1WonSets = 0;
    let team2WonSets = 0;

    const validatedSets: SetResult[] = [];
    for (const set of dto.setScores) {
      const winnerId = this.determineSetWinner(
        set,
        match.team1Id,
        match.team2Id,
        tournamentRules.pointsToWinSet,
        tournamentRules.maxPointsCap,
      );

      if (winnerId === match.team1Id) team1WonSets++;
      if (winnerId === match.team2Id) team2WonSets++;

      validatedSets.push({
        ...set,
        winnerTeamId: winnerId || undefined,
      });
    }

    match.setScores = validatedSets;

    // Xác định đội chiến thắng (ưu tiên winnerId từ payload nếu truyền lên)
    const calculatedWinnerId =
      team1WonSets > team2WonSets
        ? match.team1Id
        : team2WonSets > team1WonSets
        ? match.team2Id
        : null;

    const effectiveWinnerId =
      dto.winnerId && String(dto.winnerId).trim() !== ''
        ? String(dto.winnerId).trim()
        : calculatedWinnerId;

    const isCompleted =
      Boolean(effectiveWinnerId) ||
      team1WonSets >= setsToWinMatch ||
      team2WonSets >= setsToWinMatch ||
      (dto.setScores.length === 1 && (team1WonSets === 1 || team2WonSets === 1));

    if (isCompleted && effectiveWinnerId) {
      match.winnerId = effectiveWinnerId;
      match.status = dto.status || MatchStatus.COMPLETED;

      // LẤY TRẬN TIẾP THEO (NEXT_MATCH_ID) VÀ CẬP NHẬT THEO NEXT_MATCH_SLOT
      if (match.nextMatchId) {
        if (supabase) {
          try {
            const { data: nextMatch, error: nextErr } = await supabase
              .from('matches')
              .select('*')
              .eq('id', match.nextMatchId)
              .single();

            if (!nextErr && nextMatch) {
              const slot = Number(match.nextMatchSlot);
              let updateSlot: any = {};

              if (slot === 1) {
                updateSlot = { team1_id: effectiveWinnerId };
              } else if (slot === 2) {
                updateSlot = { team2_id: effectiveWinnerId };
              } else {
                // Nếu chưa có next_match_slot: tìm ô trống để điền
                if (!nextMatch.team1_id) {
                  updateSlot = { team1_id: effectiveWinnerId };
                } else if (!nextMatch.team2_id) {
                  updateSlot = { team2_id: effectiveWinnerId };
                } else {
                  updateSlot = { team1_id: effectiveWinnerId };
                }
              }

              await supabase
                .from('matches')
                .update(updateSlot)
                .eq('id', match.nextMatchId);

              console.log(`✅ Đã cập nhật đội thắng ${effectiveWinnerId} vào trận kế tiếp ${match.nextMatchId} (Slot ${slot || 1})`);
            }
          } catch (nextMatchUpdateError) {
            console.warn('Lỗi cập nhật trận đấu tiếp theo:', nextMatchUpdateError.message);
          }
        } else {
          const nextMatch = this.inMemoryMatches.get(match.nextMatchId);
          if (nextMatch) {
            const slot = Number(match.nextMatchSlot);
            if (slot === 1) {
              nextMatch.team1Id = effectiveWinnerId;
            } else if (slot === 2) {
              nextMatch.team2Id = effectiveWinnerId;
            } else {
              if (!nextMatch.team1Id) nextMatch.team1Id = effectiveWinnerId;
              else nextMatch.team2Id = effectiveWinnerId;
            }
            this.inMemoryMatches.set(nextMatch.id, nextMatch);
          }
        }
      }
    } else {
      match.status = validatedSets.some((s) => s.team1Score > 0 || s.team2Score > 0)
        ? MatchStatus.IN_PROGRESS
        : MatchStatus.SCHEDULED;
      match.winnerId = null;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('matches')
        .update({
          set_scores: match.setScores,
          status: match.status,
          winner_id: match.winnerId,
        })
        .eq('id', matchId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { message: 'Cập nhật tỷ số thành công', match: data };
    }

    this.inMemoryMatches.set(match.id, match);
    return { message: 'Cập nhật tỷ số thành công', match };
  }

  async getBracketTree(tournamentId: string) {
    const supabase = this.supabaseService.getClient();

    let allMatches: MatchEntity[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .neq('stage', 'GROUP')
        .order('round_number', { ascending: true })
        .order('match_order', { ascending: true });

      if (error) throw new Error(error.message);
      allMatches = (data || []).map((d) => ({
        id: d.id,
        tournamentId: d.tournament_id,
        stage: d.stage,
        groupName: d.group_name,
        roundNumber: d.round_number,
        matchOrder: d.match_order,
        roundName: d.round_name,
        team1Id: d.team1_id,
        team2Id: d.team2_id,
        winnerId: d.winner_id,
        court: d.court,
        scheduledTime: d.scheduled_time,
        setScores: d.set_scores || [],
        status: d.status,
        nextMatchId: d.next_match_id,
        nextMatchSlot: d.next_match_slot,
      }));
    } else {
      allMatches = Array.from(this.inMemoryMatches.values()).filter(
        (m) => m.tournamentId === tournamentId && m.stage !== 'GROUP',
      );
    }

    const rounds: Record<number, MatchEntity[]> = {};
    allMatches.forEach((m) => {
      if (!rounds[m.roundNumber]) rounds[m.roundNumber] = [];
      rounds[m.roundNumber].push(m);
    });

    return { tournamentId, rounds };
  }

  async findAll(): Promise<MatchEntity[]> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('round_number', { ascending: true })
          .order('match_order', { ascending: true });
        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            tournamentId: d.tournament_id,
            stage: d.stage,
            groupName: d.group_name,
            roundNumber: d.round_number,
            matchOrder: d.match_order,
            roundName: d.round_name,
            team1Id: d.team1_id,
            team2Id: d.team2_id,
            winnerId: d.winner_id,
            court: d.court,
            scheduledTime: d.scheduled_time,
            setScores: d.set_scores || [],
            status: d.status,
            nextMatchId: d.next_match_id,
            nextMatchSlot: d.next_match_slot,
          }));
        }
      } catch (err) {
        console.warn('Supabase findAll matches error:', err.message);
      }
    }
    return Array.from(this.inMemoryMatches.values());
  }

  async saveBatch(tournamentId: string, stage: string, matchesList: any[]): Promise<MatchEntity[]> {
    const supabase = this.supabaseService.getClient();

    let tournamentMaxSets = 1;
    if (supabase) {
      try {
        const { data: tourney } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
        if (tourney) {
          tournamentMaxSets = Number(tourney.max_sets || tourney.maxSets || 1);
        }
      } catch (err) {
        // Fallback default
      }
    }

    const isUUID = (str: any) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const defaultSets = [];
    for (let i = 1; i <= Math.max(1, tournamentMaxSets); i++) {
      defaultSets.push({ setNumber: i, team1Score: 0, team2Score: 0 });
    }

    const formattedRowsForSupabase = matchesList.map((m) => {
      let setScores = m.setScores || m.set_scores;
      if (!Array.isArray(setScores) || setScores.length === 0) {
        setScores = defaultSets;
      }

      const row: any = {
        tournament_id: String(tournamentId),
        stage: m.stage || stage || 'KNOCKOUT',
        group_name: m.groupName || null,
        round_number: Number(m.roundNumber) || 1,
        match_order: Number(m.matchOrder) || 1,
        round_name: m.roundName || null,
        team1_id: m.team1Id && String(m.team1Id).trim() !== '' ? String(m.team1Id) : null,
        team2_id: m.team2Id && String(m.team2Id).trim() !== '' ? String(m.team2Id) : null,
        winner_id: m.winnerId && String(m.winnerId).trim() !== '' ? String(m.winnerId) : null,
        court: m.court || 'Sân 1',
        scheduled_time: m.scheduledTime || null,
        set_scores: setScores,
        status: m.status || MatchStatus.SCHEDULED,
        next_match_slot: m.nextMatchSlot ? Number(m.nextMatchSlot) : null,
      };

      if (m.id && isUUID(m.id)) {
        row.id = m.id;
      }
      if (m.nextMatchId && isUUID(m.nextMatchId)) {
        row.next_match_id = m.nextMatchId;
      }

      return row;
    });

    if (supabase) {
      try {
        // Xóa các trận đấu cũ thuộc stage này của giải
        const { error: delErr } = await supabase
          .from('matches')
          .delete()
          .eq('tournament_id', String(tournamentId))
          .eq('stage', stage);

        if (delErr) {
          console.warn('Supabase delete old matches warning:', delErr.message);
        }

        // Chèn danh sách các trận mới
        const { data, error } = await supabase
          .from('matches')
          .insert(formattedRowsForSupabase)
          .select();

        if (error) {
          console.error('❌ Supabase insert matches error:', error.message);
        } else if (data && data.length > 0) {
          console.log(`✅ Đã lưu thành công ${data.length} trận đấu (${stage}) vào Supabase DB`);
          return data.map((d) => ({
            id: String(d.id),
            tournamentId: String(d.tournament_id),
            stage: d.stage,
            groupName: d.group_name,
            roundNumber: d.round_number,
            matchOrder: d.match_order,
            roundName: d.round_name,
            team1Id: d.team1_id,
            team2Id: d.team2_id,
            winnerId: d.winner_id,
            court: d.court,
            scheduledTime: d.scheduled_time,
            setScores: d.set_scores || [],
            status: d.status,
            nextMatchId: d.next_match_id,
            nextMatchSlot: d.next_match_slot,
          }));
        }
      } catch (err) {
        console.error('❌ Supabase saveBatch exception:', err.message);
      }
    }

    // Fallback in-memory
    const updated = Array.from(this.inMemoryMatches.values()).filter(
      (m) => String(m.tournamentId) !== String(tournamentId) || m.stage !== stage
    );
    matchesList.forEach((m, idx) => {
      const id = m.id || `m-${Date.now()}-${idx + 1}`;
      updated.push({
        id,
        tournamentId: String(tournamentId),
        stage: m.stage || stage || 'KNOCKOUT',
        groupName: m.groupName || null,
        roundNumber: Number(m.roundNumber) || 1,
        matchOrder: Number(m.matchOrder) || 1,
        roundName: m.roundName || null,
        team1Id: m.team1Id || null,
        team2Id: m.team2Id || null,
        winnerId: m.winnerId || null,
        court: m.court || 'Sân 1',
        scheduledTime: m.scheduledTime || null,
        setScores: m.setScores || [],
        status: m.status || MatchStatus.SCHEDULED,
        nextMatchId: m.nextMatchId || null,
        nextMatchSlot: m.nextMatchSlot || null,
      });
    });
    this.inMemoryMatches = new Map(updated.map((m) => [m.id, m]));
    return updated.filter((m) => String(m.tournamentId) === String(tournamentId) && m.stage === stage);
  }

  async findByTournament(tournamentId: string): Promise<MatchEntity[]> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_order', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []).map((d) => ({
        id: d.id,
        tournamentId: d.tournament_id,
        stage: d.stage,
        groupName: d.group_name,
        roundNumber: d.round_number,
        matchOrder: d.match_order,
        roundName: d.round_name,
        team1Id: d.team1_id,
        team2Id: d.team2_id,
        winnerId: d.winner_id,
        court: d.court,
        scheduledTime: d.scheduled_time,
        setScores: d.set_scores || [],
        status: d.status,
        nextMatchId: d.next_match_id,
        nextMatchSlot: d.next_match_slot,
      }));
    }

    return Array.from(this.inMemoryMatches.values()).filter((m) => m.tournamentId === tournamentId);
  }
}

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Post('batch')
  async saveBatch(@Body() body: { tournamentId: string; stage: string; matches: any[] }) {
    return this.matchesService.saveBatch(body.tournamentId, body.stage, body.matches);
  }

  @Get('tournament/:tournamentId')
  async getMatchesByTournament(@Param('tournamentId') tournamentId: string) {
    return this.matchesService.findByTournament(tournamentId);
  }

  @Get('tournament/:tournamentId/bracket')
  async getBracket(@Param('tournamentId') tournamentId: string) {
    return this.matchesService.getBracketTree(tournamentId);
  }

  @Patch(':id/score')
  async updateScore(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateMatchScoreDto,
  ) {
    return this.matchesService.updateScore(id, updateScoreDto);
  }
}

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
