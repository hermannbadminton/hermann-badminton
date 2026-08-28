import { SupabaseService } from '../supabase/supabase.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentStatus } from '../../common/enums/tournament-status.enum';
export interface TournamentEntity {
    id: string;
    name: string;
    category: string;
    format?: string;
    groupCount?: number;
    advancingPerGroup?: number;
    startDate: string;
    endDate: string;
    location: string;
    prizePool?: string;
    rulesDescription?: string;
    maxSets: number;
    pointsToWinSet: number;
    maxPointsCap: number;
    banner?: string;
    status: TournamentStatus;
    createdAt?: Date;
}
export declare class TournamentsService {
    private readonly supabaseService;
    private readonly logger;
    private inMemoryTournaments;
    constructor(supabaseService: SupabaseService);
    private mapFromDb;
    create(dto: CreateTournamentDto): Promise<TournamentEntity>;
    findAll(status?: TournamentStatus): Promise<TournamentEntity[]>;
    findOne(id: string): Promise<TournamentEntity>;
    update(id: string, dto: Partial<CreateTournamentDto>): Promise<TournamentEntity>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
