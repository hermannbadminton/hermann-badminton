import { SupabaseService } from '../supabase/supabase.service';
export declare class CreateBracketDto {
    tournamentId: string;
    name?: string;
    bracketSize?: number;
    totalRounds?: number;
    roundsConfig?: any[];
    initialPairs?: any[];
    matches?: any[];
    matchesData?: any[];
    historyLog?: any[];
    status?: string;
    championTeamId?: string;
    isActive?: boolean;
}
export declare class UpdateBracketDto {
    name?: string;
    bracketSize?: number;
    totalRounds?: number;
    roundsConfig?: any[];
    initialPairs?: any[];
    matches?: any[];
    matchesData?: any[];
    historyLog?: any[];
    status?: string;
    championTeamId?: string;
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
export declare class BracketsService {
    private readonly supabaseService;
    private inMemoryBrackets;
    constructor(supabaseService: SupabaseService);
    private mapFromDb;
    findAll(): Promise<BracketEntity[]>;
    saveBracket(dto: CreateBracketDto): Promise<BracketEntity>;
    findByTournament(tournamentId: string): Promise<BracketEntity | null>;
    updateHistory(tournamentId: string, historyEntry: any): Promise<BracketEntity>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
export declare class BracketsController {
    private readonly bracketsService;
    constructor(bracketsService: BracketsService);
    findAll(): Promise<BracketEntity[]>;
    findByTournament(tournamentId: string): Promise<BracketEntity>;
    save(dto: CreateBracketDto): Promise<BracketEntity>;
    updateHistory(tournamentId: string, body: {
        historyEntry: any;
    }): Promise<BracketEntity>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
export declare class BracketsModule {
}
