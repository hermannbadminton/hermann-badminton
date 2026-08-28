import { Module, Injectable, NotFoundException } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên đội/VĐV không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsOptional()
  seed?: number;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  isQualifiedKnockout?: boolean;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsOptional()
  seed?: number;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  isQualifiedKnockout?: boolean;
}

export interface TeamEntity {
  id: string;
  tournamentId: string;
  name: string;
  groupName?: string;
  seed?: number | null;
  avatar?: string;
  isQualifiedKnockout?: boolean;
}

@Injectable()
export class TeamsService {
  private inMemoryTeams: Map<string, TeamEntity> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateTeamDto): Promise<TeamEntity> {
    const supabase = this.supabaseService.getClient();

    const dataToSave = {
      tournament_id: dto.tournamentId,
      name: dto.name,
      group_name: dto.groupName || 'Bảng A',
      seed: dto.seed ? Number(dto.seed) : null,
      avatar: dto.avatar || '🏸',
      is_qualified_knockout: dto.isQualifiedKnockout || false,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .insert(dataToSave)
          .select()
          .single();
        if (!error && data) {
          return {
            id: data.id,
            tournamentId: data.tournament_id,
            name: data.name,
            groupName: data.group_name,
            seed: data.seed,
            avatar: data.avatar,
            isQualifiedKnockout: data.is_qualified_knockout || false,
          };
        }
      } catch (err) {
        console.warn('Supabase create team error:', err.message);
      }
    }

    const id = `team-${Date.now()}`;
    const newTeam: TeamEntity = {
      id,
      tournamentId: dto.tournamentId,
      name: dto.name,
      groupName: dto.groupName || 'Bảng A',
      seed: dto.seed ? Number(dto.seed) : null,
      avatar: dto.avatar || '🏸',
      isQualifiedKnockout: dto.isQualifiedKnockout || false,
    };
    this.inMemoryTeams.set(id, newTeam);
    return newTeam;
  }

  async findAll(): Promise<TeamEntity[]> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) {
          return data.map((t) => ({
            id: t.id,
            tournamentId: t.tournament_id,
            name: t.name,
            groupName: t.group_name,
            seed: t.seed,
            avatar: t.avatar,
            isQualifiedKnockout: t.is_qualified_knockout || false,
          }));
        }
      } catch (err) {
        console.warn('Supabase findAll teams error:', err.message);
      }
    }
    return Array.from(this.inMemoryTeams.values());
  }

  async findByTournament(tournamentId: string): Promise<TeamEntity[]> {
    const supabase = this.supabaseService.getClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('created_at', { ascending: true });
        if (!error && data) {
          return data.map((t) => ({
            id: t.id,
            tournamentId: t.tournament_id,
            name: t.name,
            groupName: t.group_name,
            seed: t.seed,
            avatar: t.avatar,
            isQualifiedKnockout: t.is_qualified_knockout || false,
          }));
        }
      } catch (err) {
        console.warn('Supabase findByTournament teams error:', err.message);
      }
    }

    return Array.from(this.inMemoryTeams.values()).filter((t) => t.tournamentId === tournamentId);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamEntity> {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        const updateData: any = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.groupName !== undefined) updateData.group_name = dto.groupName;
        if (dto.seed !== undefined) updateData.seed = dto.seed;
        if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
        if (dto.isQualifiedKnockout !== undefined) updateData.is_qualified_knockout = dto.isQualifiedKnockout;

        const { data, error } = await supabase
          .from('teams')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated: TeamEntity = {
            id: data.id,
            tournamentId: data.tournament_id,
            name: data.name,
            groupName: data.group_name,
            seed: data.seed,
            avatar: data.avatar,
            isQualifiedKnockout: data.is_qualified_knockout || false,
          };
          this.inMemoryTeams.set(id, updated);
          return updated;
        }
      } catch (err) {
        console.warn('Supabase update team error:', err.message);
      }
    }

    const current = this.inMemoryTeams.get(id);
    const updated: TeamEntity = {
      id,
      tournamentId: current?.tournamentId || '',
      name: dto.name ?? current?.name ?? '',
      groupName: dto.groupName ?? current?.groupName,
      seed: dto.seed ?? current?.seed,
      avatar: dto.avatar ?? current?.avatar,
      isQualifiedKnockout: dto.isQualifiedKnockout ?? current?.isQualifiedKnockout ?? false,
    };
    this.inMemoryTeams.set(id, updated);
    return updated;
  }

  async updateKnockoutQualifiers(tournamentId: string, qualifiedTeamIds: string[]) {
    const supabase = this.supabaseService.getClient();
    if (supabase) {
      try {
        const { error: err1 } = await supabase
          .from('teams')
          .update({ is_qualified_knockout: false })
          .eq('tournament_id', String(tournamentId));

        if (err1) {
          console.warn('Supabase reset qualifiers warning:', err1.message);
        }

        if (qualifiedTeamIds && qualifiedTeamIds.length > 0) {
          const { error: err2 } = await supabase
            .from('teams')
            .update({ is_qualified_knockout: true })
            .in('id', qualifiedTeamIds);

          if (err2) {
            console.warn('Supabase set qualifiers warning:', err2.message);
          } else {
            console.log(`✅ Đã cập nhật ${qualifiedTeamIds.length} đội vào nhánh Knockout trong Supabase`);
          }
        }
      } catch (err) {
        console.warn('Supabase updateKnockoutQualifiers error:', err.message);
      }
    }

    for (const [id, team] of this.inMemoryTeams.entries()) {
      if (String(team.tournamentId) === String(tournamentId)) {
        team.isQualifiedKnockout = qualifiedTeamIds.includes(id);
        this.inMemoryTeams.set(id, { ...team });
      }
    }

    return { success: true, qualifiedTeamIds };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const supabase = this.supabaseService.getClient();

    if (supabase) {
      try {
        const { error } = await supabase.from('teams').delete().eq('id', id);
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Supabase remove team error:', err.message);
      }
    }

    this.inMemoryTeams.delete(id);
    return { success: true };
  }
}

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get('tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.teamsService.findByTournament(tournamentId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Post('tournament/:tournamentId/qualify')
  async updateKnockoutQualifiers(
    @Param('tournamentId') tournamentId: string,
    @Body() body: { qualifiedTeamIds: string[] },
  ) {
    return this.teamsService.updateKnockoutQualifiers(tournamentId, body.qualifiedTeamIds || []);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }
}

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
