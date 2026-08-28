import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentStatus } from '../../common/enums/tournament-status.enum';
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    create(createTournamentDto: CreateTournamentDto): Promise<import("./tournaments.service").TournamentEntity>;
    findAll(status?: TournamentStatus): Promise<import("./tournaments.service").TournamentEntity[]>;
    findOne(id: string): Promise<import("./tournaments.service").TournamentEntity>;
    patch(id: string, updateTournamentDto: UpdateTournamentDto): Promise<import("./tournaments.service").TournamentEntity>;
    update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<import("./tournaments.service").TournamentEntity>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
