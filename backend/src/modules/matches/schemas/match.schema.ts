import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MatchStatus } from '../../../common/enums/tournament-status.enum';

export type MatchDocument = Match & Document;

@Schema({ _id: false })
export class SetScore {
  @Prop({ required: true })
  setNumber: number;

  @Prop({ default: 0 })
  team1Score: number;

  @Prop({ default: 0 })
  team2Score: number;

  @Prop()
  winnerTeamId?: string;
}

export const SetScoreSchema = SchemaFactory.createForClass(SetScore);

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Match {
  @Prop({ required: true })
  tournamentId: string;

  @Prop({ default: 'KNOCKOUT' })
  stage: string; // 'GROUP' or 'KNOCKOUT'

  @Prop()
  groupName?: string;

  @Prop({ required: true })
  roundNumber: number;

  @Prop({ required: true })
  matchOrder: number;

  @Prop()
  roundName?: string;

  @Prop({ default: null })
  team1Id: string | null;

  @Prop({ default: null })
  team2Id: string | null;

  @Prop({ default: null })
  winnerId: string | null;

  @Prop({ default: 'Sân 1' })
  court?: string;

  @Prop()
  scheduledTime?: string;

  @Prop({ type: [SetScoreSchema], default: [] })
  setScores: SetScore[];

  @Prop({ type: String, enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Prop({ default: null })
  nextMatchId: string | null;

  @Prop({ default: null })
  nextMatchSlot: number | null;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
