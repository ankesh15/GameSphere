import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type MatchSessionDocument = MatchSession & Document;

@Schema({ timestamps: true })
export class MatchSession {
  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ trim: true })
  region?: string;

  @Prop({
    type: [Types.ObjectId],
    ref: User.name,
    required: true,
    default: []
  })
  playerIds!: Types.ObjectId[];

  @Prop({
    type: [Types.ObjectId],
    ref: "MatchRequest",
    default: []
  })
  requestIds!: Types.ObjectId[];

  @Prop({
    type: String,
    default: "pending",
    index: true
  })
  status!: "pending" | "active" | "completed" | "cancelled" | "declined";

  @Prop({
    type: [Types.ObjectId],
    ref: User.name,
    default: []
  })
  acceptedBy!: Types.ObjectId[];

  @Prop({
    type: [Types.ObjectId],
    ref: User.name,
    default: []
  })
  declinedBy!: Types.ObjectId[];

  @Prop()
  expiresAt?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ min: 0, max: 1 })
  aiQualityScore?: number;
}

export const MatchSessionSchema = SchemaFactory.createForClass(MatchSession);

MatchSessionSchema.index({ status: 1, startedAt: -1 });
MatchSessionSchema.index({ playerIds: 1 });
MatchSessionSchema.index({ gameId: 1, status: 1 });
