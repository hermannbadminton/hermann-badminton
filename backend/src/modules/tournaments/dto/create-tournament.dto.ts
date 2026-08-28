import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { TournamentStatus } from '../../../common/enums/tournament-status.enum';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên giải đấu không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  category?: string = 'Đơn Nam';

  @IsString()
  @IsOptional()
  format?: string = 'GROUP_KNOCKOUT';

  @IsOptional()
  groupCount?: number = 2;

  @IsOptional()
  advancingPerGroup?: number = 2;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  prizePool?: string;

  @IsString()
  @IsOptional()
  rulesDescription?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  maxSets: number = 3;

  @IsInt()
  @Min(11)
  @Max(30)
  pointsToWinSet: number = 21;

  @IsInt()
  @Min(21)
  @Max(35)
  maxPointsCap: number = 30;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus = TournamentStatus.UPCOMING;
}
