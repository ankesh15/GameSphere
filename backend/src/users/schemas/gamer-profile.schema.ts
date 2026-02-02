import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type GamerProfileDocument = GamerProfile & Document;

@Schema({ timestamps: true })
export class GamerProfile {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true
  })
  gamerTag!: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ trim: true, maxlength: 500 })
  bio?: string;

  @Prop({ trim: true, index: true })
  region?: string;

  @Prop({ min: 1, max: 10, index: true })
  skillRating?: number;

  @Prop({
    trim: true,
    index: true,
    enum: ["beginner", "intermediate", "advanced", "pro"]
  })
  skillLevel?: "beginner" | "intermediate" | "advanced" | "pro";

  @Prop({ type: [String], default: [] })
  favoriteGames!: string[];

  @Prop({ type: [String], default: [] })
  platforms!: string[];

  @Prop({
    type: {
      competitiveStyle: { type: String },
      communicationStyle: { type: String },
      preferredRoles: { type: [String], default: [] }
    },
    default: () => ({})
  })
  playstyle?: {
    competitiveStyle?: string;
    communicationStyle?: string;
    preferredRoles?: string[];
  };

  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: { type: String },
        endTime: { type: String },
        timezone: { type: String }
      }
    ],
    default: []
  })
  availability!: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone?: string;
  }>;

  @Prop({
    type: [
      {
        provider: {
          type: String,
          required: true,
          enum: ["steam", "riot", "epic"]
        },
        handle: { type: String, required: true, trim: true },
        externalId: { type: String },
        linkedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  })
  gamingAccounts!: Array<{
    provider: "steam" | "riot" | "epic";
    handle: string;
    externalId?: string;
    linkedAt?: Date;
  }>;

  @Prop({
    type: {
      isPublic: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      showMatchHistory: { type: Boolean, default: true }
    },
    default: () => ({})
  })
  privacy?: {
    isPublic?: boolean;
    showOnlineStatus?: boolean;
    showMatchHistory?: boolean;
  };

  @Prop({
    type: [
      {
        code: { type: String, required: true },
        label: { type: String, required: true },
        awardedAt: { type: Date, default: Date.now },
        source: { type: String }
      }
    ],
    default: []
  })
  badges!: Array<{
    code: string;
    label: string;
    awardedAt?: Date;
    source?: string;
  }>;

  @Prop({
    type: {
      genres: { type: [String], default: [] },
      modes: { type: [String], default: [] }
    },
    default: () => ({})
  })
  preferences?: {
    genres?: string[];
    modes?: string[];
  };
}

export const GamerProfileSchema = SchemaFactory.createForClass(GamerProfile);

GamerProfileSchema.index({ region: 1, skillRating: -1 });
