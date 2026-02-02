import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type ClanDocument = Clan & Document;

@Schema({ timestamps: true })
export class Clan {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  tag!: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  memberIds!: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: User.name, required: true },
        role: {
          type: String,
          enum: ["owner", "admin", "moderator", "member"],
          default: "member"
        },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  })
  members!: Array<{
    userId: Types.ObjectId;
    role: "owner" | "admin" | "moderator" | "member";
    joinedAt?: Date;
  }>;

  @Prop({ trim: true, index: true })
  region?: string;

  @Prop({ type: [String], default: [] })
  gameIds!: string[];

  @Prop({ default: true })
  isPublic!: boolean;

  @Prop({ default: false })
  recruiting!: boolean;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: User.name, required: true },
        invitedBy: { type: Types.ObjectId, ref: User.name, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  })
  invites!: Array<{
    userId: Types.ObjectId;
    invitedBy: Types.ObjectId;
    createdAt?: Date;
  }>;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        description: { type: String },
        startsAt: { type: Date, required: true },
        endsAt: { type: Date },
        createdBy: { type: Types.ObjectId, ref: User.name, required: true }
      }
    ],
    default: []
  })
  events!: Array<{
    title: string;
    description?: string;
    startsAt: Date;
    endsAt?: Date;
    createdBy: Types.ObjectId;
  }>;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);

ClanSchema.index({ memberIds: 1 });
ClanSchema.index({ "members.userId": 1 });
