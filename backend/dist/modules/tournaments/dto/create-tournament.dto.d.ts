import { TournamentStatus } from '../../../common/enums/tournament-status.enum';
export declare class CreateTournamentDto {
    name: string;
    category?: string;
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
    status?: TournamentStatus;
}
