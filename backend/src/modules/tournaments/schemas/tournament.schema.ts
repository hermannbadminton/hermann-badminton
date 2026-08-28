import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TournamentStatus } from '../../../common/enums/tournament-status.enum';

export type TournamentDocument = Tournament & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Đơn Nam' })
  category: string;

  @Prop({ default: 'GROUP_KNOCKOUT' })
  format: string; // GROUP_KNOCKOUT, KNOCKOUT, ROUND_ROBIN

  @Prop({ default: 2 })
  groupCount: number;

  @Prop({ default: 2 })
  advancingPerGroup: number;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true })
  location: string;

  @Prop({ default: '20.000.000 VNĐ' })
  prizePool: string;

  @Prop({ default: 'Áp dụng luật cầu lông BWF tiêu chuẩn.' })
  rulesDescription: string;

  @Prop({ default: 3 })
  maxSets: number;

  @Prop({ default: 21 })
  pointsToWinSet: number;

  @Prop({ default: 30 })
  maxPointsCap: number;

  @Prop({ default: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80' })
  banner: string;

  @Prop({ type: String, enum: TournamentStatus, default: TournamentStatus.UPCOMING })
  status: TournamentStatus;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
