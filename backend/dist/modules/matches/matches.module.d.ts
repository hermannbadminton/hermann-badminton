import { MatchStatus } from '../../common/enums/tournament-status.enum';
import { SupabaseService } from '../supabase/supabase.service';
export declare class SetScoreDto {
    setNumber: number;
    team1Score: number;
    team2Score: number;
}
export declare class UpdateMatchScoreDto {
    setScores?: SetScoreDto[];
    winnerId?: string;
    status?: MatchStatus;
    scheduledTime?: string;
    court?: string;
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
export declare class MatchesService {
    private readonly supabaseService;
    private inMemoryMatches;
    constructor(supabaseService: SupabaseService);
    private determineSetWinner;
    updateScore(matchId: string, dto: UpdateMatchScoreDto, tournamentRules?: {
        maxSets: number;
        pointsToWinSet: number;
        maxPointsCap: number;
    }): Promise<{
        message: string;
        match: any;
    }>;
    getBracketTree(tournamentId: string): Promise<{
        tournamentId: string;
        rounds: Record<number, MatchEntity[]>;
    }>;
    findAll(): Promise<MatchEntity[]>;
    saveBatch(tournamentId: string, stage: string, matchesList: any[]): Promise<MatchEntity[]>;
    findByTournament(tournamentId: string): Promise<MatchEntity[]>;
}
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    findAll(): Promise<MatchEntity[]>;
    saveBatch(body: {
        tournamentId: string;
        stage: string;
        matches: any[];
    }): Promise<MatchEntity[]>;
    getMatchesByTournament(tournamentId: string): Promise<MatchEntity[]>;
    getBracket(tournamentId: string): Promise<{
        tournamentId: string;
        rounds: Record<number, MatchEntity[]>;
    }>;
    updateScore(id: string, updateScoreDto: UpdateMatchScoreDto): Promise<{
        message: string;
        match: any;
    }>;
}
export declare class MatchesModule {
}
