import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type TournamentDocument = Tournament & Document;

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ trim: true, index: true })
  region?: string;

  @Prop({
    type: String,
    default: "scheduled",
    index: true
  })
  status!: "scheduled" | "live" | "completed" | "cancelled";

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  organizerId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  participantIds!: Types.ObjectId[];

  @Prop({
    type: [
      {
        round: { type: Number, required: true },
        matches: [
          {
            matchId: { type: String, required: true },
            participantIds: { type: [Types.ObjectId], ref: User.name, default: [] },
            scores: { type: [Number], default: [] },
            winnerId: { type: Types.ObjectId, ref: User.name },
            status: {
              type: String,
              enum: ["pending", "submitted", "verified", "bye"],
              default: "pending"
            },
            reportedBy: { type: Types.ObjectId, ref: User.name },
            reportedAt: { type: Date }
          }
        ]
      }
    ],
    default: []
  })
  bracket!: Array<{
    round: number;
    matches: Array<{
      matchId: string;
      participantIds: Types.ObjectId[];
      scores?: number[];
      winnerId?: Types.ObjectId;
      status: "pending" | "submitted" | "verified" | "bye";
      reportedBy?: Types.ObjectId;
      reportedAt?: Date;
    }>;
  }>;

  @Prop({ min: 2, max: 1024 })
  maxParticipants?: number;

  @Prop()
  startAt?: Date;

  @Prop()
  endAt?: Date;

  @Prop({ min: 0 })
  prizePool?: number;

  @Prop({ type: Types.ObjectId, ref: User.name })
  winnerId?: Types.ObjectId;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ startAt: 1 });
TournamentSchema.index({ gameId: 1, status: 1 });
TournamentSchema.index({ participantIds: 1 });
