import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type MatchRequestDocument = MatchRequest & Document;

@Schema({ timestamps: true })
export class MatchRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ trim: true, index: true })
  region?: string;

  @Prop({ min: 1, max: 10 })
  skill?: number;

  @Prop({ min: 0, max: 1000 })
  pingMs?: number;

  @Prop({ min: 0, max: 1000 })
  maxPingMs?: number;

  @Prop({
    type: String,
    default: "queued",
    index: true
  })
  status!: "queued" | "matched" | "cancelled" | "expired";

  @Prop({ type: Types.ObjectId, ref: "MatchSession", index: true })
  matchSessionId?: Types.ObjectId;

  @Prop()
  expiresAt?: Date;
}

export const MatchRequestSchema = SchemaFactory.createForClass(MatchRequest);

MatchRequestSchema.index({ status: 1, createdAt: -1 });
MatchRequestSchema.index({ userId: 1, status: 1 });
MatchRequestSchema.index({ gameId: 1, region: 1, status: 1 });
MatchRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
