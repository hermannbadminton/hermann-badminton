import { SupabaseService } from '../supabase/supabase.service';
export declare class CreateTeamDto {
    tournamentId: string;
    name: string;
    groupName?: string;
    seed?: number;
    avatar?: string;
    isQualifiedKnockout?: boolean;
}
export declare class UpdateTeamDto {
    name?: string;
    groupName?: string;
    seed?: number;
    avatar?: string;
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
export declare class TeamsService {
    private readonly supabaseService;
    private inMemoryTeams;
    constructor(supabaseService: SupabaseService);
    create(dto: CreateTeamDto): Promise<TeamEntity>;
    findAll(): Promise<TeamEntity[]>;
    findByTournament(tournamentId: string): Promise<TeamEntity[]>;
    update(id: string, dto: UpdateTeamDto): Promise<TeamEntity>;
    updateKnockoutQualifiers(tournamentId: string, qualifiedTeamIds: string[]): Promise<{
        success: boolean;
        qualifiedTeamIds: string[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    findAll(): Promise<TeamEntity[]>;
    create(createTeamDto: CreateTeamDto): Promise<TeamEntity>;
    findByTournament(tournamentId: string): Promise<TeamEntity[]>;
    update(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamEntity>;
    updateKnockoutQualifiers(tournamentId: string, body: {
        qualifiedTeamIds: string[];
    }): Promise<{
        success: boolean;
        qualifiedTeamIds: string[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
export declare class TeamsModule {
}
