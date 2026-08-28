import { IsString, IsOptional, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { TournamentStatus } from '../../../common/enums/tournament-status.enum';

export class UpdateTournamentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  format?: string;

  @IsOptional()
  groupCount?: number;

  @IsOptional()
  advancingPerGroup?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  prizePool?: string;

  @IsString()
  @IsOptional()
  rulesDescription?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  maxSets?: number;

  @IsInt()
  @IsOptional()
  @Min(11)
  @Max(30)
  pointsToWinSet?: number;

  @IsInt()
  @IsOptional()
  @Min(21)
  @Max(35)
  maxPointsCap?: number;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;
}
