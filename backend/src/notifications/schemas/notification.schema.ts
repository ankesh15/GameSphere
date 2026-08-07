import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  recipientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  senderId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      "friend_request",
      "team_invitation",
      "tournament_invitation",
      "tournament_update",
      "chat_message",
      "clan_invitation",
      "match_reminder",
      "achievement_unlock",
      "ai_recommendation",
      "system_announcement"
    ]
  })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ type: Object, default: {} })
  data?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
