import { Module, Injectable, NotFoundException } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateBracketDto {
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  bracketSize?: number;

  @IsNumber()
  @IsOptional()
  totalRounds?: number;

  @IsArray()
  @IsOptional()
  roundsConfig?: any[];

  @IsArray()
  @IsOptional()
  initialPairs?: any[];

  @IsArray()
  @IsOptional()
  matches?: any[];

  @IsArray()
  @IsOptional()
  matchesData?: any[];

  @IsArray()
  @IsOptional()
  historyLog?: any[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  championTeamId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBracketDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  bracketSize?: number;

  @IsNumber()
  @IsOptional()
  totalRounds?: number;

  @IsArray()
  @IsOptional()
  roundsConfig?: any[];

  @IsArray()
  @IsOptional()
  initialPairs?: any[];

  @IsArray()
  @IsOptional()
  matches?: any[];

  @IsArray()
  @IsOptional()
  matchesData?: any[];

  @IsArray()
  @IsOptional()
  historyLog?: any[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  championTeamId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export interface BracketEntity {
  id: string;
  tournamentId: string;
  name: string;
  bracketSize: number;
  totalRounds: number;
  roundsConfig: any[];
  initialPairs: any[];
  matches: any[];
  historyLog: any[];
  status: string;
  championTeamId: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable()
export class BracketsService {
  private inMemoryBrackets: Map<string, BracketEntity> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  private mapFromDb(d: any): BracketEntity {
    return {
      id: String(d.id),
      tournamentId: String(d.tournament_id),
      name: d.name || 'Sơ Đồ Nhánh Đấu Knockout',
      bracketSize: Number(d.bracket_size) || 8,
      totalRounds: Number(d.total_rounds) || 3,
      roundsConfig: d.rounds_config || [],
      initialPairs: d.initial_pairs || [],
      matches: d.matches_data || d.matches || [],
      historyLog: d.history_log || [],
      status: d.status || 'ACTIVE',
      championTeamId: d.champion_team_id || null,
      isActive: d.is_active !== undefined ? d.is_active : true,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  async findAll(): Promise<BracketEntity[]> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brackets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => this.mapFromDb(d));
        }
      } catch (err) {
        console.warn('Supabase findAll brackets error:', err.message);
      }
    }
    return Array.from(this.inMemoryBrackets.values());
  }

  async saveBracket(dto: CreateBracketDto): Promise<BracketEntity> {
    const supabase = this.supabaseService.getClient();

    const matchesArray = dto.matches || dto.matchesData || [];

    const dataToSave = {
      tournament_id: String(dto.tournamentId),
      name: dto.name || 'Sơ Đồ Nhánh Đấu Knockout',
      bracket_size: Number(dto.bracketSize) || 8,
      total_rounds: Number(dto.totalRounds) || 3,
      rounds_config: dto.roundsConfig || [],
      initial_pairs: dto.initialPairs || [],
      matches_data: matchesArray,
      history_log: dto.historyLog || [],
      status: dto.status || 'ACTIVE',
      champion_team_id: dto.championTeamId || null,
      is_active: dto.isActive !== undefined ? dto.isActive : true,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        // Kiểm tra xem đã có sơ đồ nhánh chính của giải chưa
        const { data: existing } = await supabase
          .from('brackets')
          .select('*')
          .eq('tournament_id', String(dto.tournamentId))
          .limit(1);

        if (existing && existing.length > 0) {
          const bracketId = existing[0].id;
          const { data, error } = await supabase
            .from('brackets')
            .update(dataToSave)
            .eq('id', bracketId)
            .select()
            .single();

          if (!error && data) {
            const mapped = this.mapFromDb(data);
            this.inMemoryBrackets.set(mapped.id, mapped);
            console.log(`✅ Đã cập nhật sơ đồ nhánh đấu #${bracketId} kèm ${matchesArray.length} trận trong Supabase DB`);
            return mapped;
          } else if (error) {
            console.warn('Supabase update bracket error:', error.message);
          }
        } else {
          const { data, error } = await supabase
            .from('brackets')
            .insert(dataToSave)
            .select()
            .single();

          if (!error && data) {
            const mapped = this.mapFromDb(data);
            this.inMemoryBrackets.set(mapped.id, mapped);
            console.log(`✅ Đã tạo mới sơ đồ nhánh đấu kèm ${matchesArray.length} trận trong Supabase DB`);
            return mapped;
          } else if (error) {
            console.warn('Supabase insert bracket error:', error.message);
          }
        }
      } catch (err) {
        console.warn('Supabase saveBracket exception:', err.message);
      }
    }

    // Fallback in-memory
    const existing = Array.from(this.inMemoryBrackets.values()).find(
      (b) => String(b.tournamentId) === String(dto.tournamentId)
    );

    const id = existing?.id || `brk-${Date.now()}`;
    const newBracket: BracketEntity = {
      id,
      tournamentId: dto.tournamentId,
      name: dto.name || 'Sơ Đồ Nhánh Đấu Knockout',
      bracketSize: Number(dto.bracketSize) || 8,
      totalRounds: Number(dto.totalRounds) || 3,
      roundsConfig: dto.roundsConfig || [],
      initialPairs: dto.initialPairs || [],
      matches: matchesArray,
      historyLog: dto.historyLog || [],
      status: dto.status || 'ACTIVE',
      championTeamId: dto.championTeamId || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryBrackets.set(id, newBracket);
    return newBracket;
  }

  async findByTournament(tournamentId: string): Promise<BracketEntity | null> {
    const supabase = this.supabaseService.getClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brackets')
          .select('*')
          .eq('tournament_id', String(tournamentId))
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const mapped = this.mapFromDb(data[0]);
          this.inMemoryBrackets.set(mapped.id, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase findByTournament bracket error:', err.message);
      }
    }

    const found = Array.from(this.inMemoryBrackets.values()).find(
      (b) => String(b.tournamentId) === String(tournamentId)
    );
    return found || null;
  }

  async updateHistory(tournamentId: string, historyEntry: any): Promise<BracketEntity> {
    const bracket = await this.findByTournament(tournamentId);
    if (!bracket) {
      throw new NotFoundException(`Không tìm thấy sơ đồ nhánh của giải #${tournamentId}`);
    }

    const updatedHistory = [...(bracket.historyLog || []), historyEntry];
    return this.saveBracket({
      ...bracket,
      historyLog: updatedHistory,
    });
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        await supabase.from('brackets').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase remove bracket error:', err.message);
      }
    }
    this.inMemoryBrackets.delete(id);
    return { success: true };
  }
}

@Controller('brackets')
export class BracketsController {
  constructor(private readonly bracketsService: BracketsService) {}

  @Get()
  async findAll() {
    return this.bracketsService.findAll();
  }

  @Get('tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.bracketsService.findByTournament(tournamentId);
  }

  @Post()
  async save(@Body() dto: CreateBracketDto) {
    return this.bracketsService.saveBracket(dto);
  }

  @Post('tournament/:tournamentId/history')
  async updateHistory(
    @Param('tournamentId') tournamentId: string,
    @Body() body: { historyEntry: any }
  ) {
    return this.bracketsService.updateHistory(tournamentId, body.historyEntry);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bracketsService.remove(id);
  }
}

@Module({
  controllers: [BracketsController],
  providers: [BracketsService],
  exports: [BracketsService],
})
export class BracketsModule {}
