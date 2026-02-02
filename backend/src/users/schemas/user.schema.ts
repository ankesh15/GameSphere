import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  })
  email!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true
  })
  username!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  refreshTokenHash?: string;

  @Prop({
    type: [String],
    default: ["user"],
    enum: ["user", "admin", "organizer"]
  })
  roles!: string[];

  @Prop({
    type: String,
    default: "active",
    index: true
  })
  status!: "active" | "disabled" | "pending";

  @Prop({ type: Types.ObjectId, ref: "GamerProfile" })
  profileId?: Types.ObjectId;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ status: 1, createdAt: -1 });
