import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Team {
  @Prop({ required: true })
  tournamentId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Bảng A' })
  groupName?: string;

  @Prop({ default: null })
  seed?: number;

  @Prop({ default: '🏸' })
  avatar: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
