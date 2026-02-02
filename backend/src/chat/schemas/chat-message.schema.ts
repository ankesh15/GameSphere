import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Clan } from "../../clan/schemas/clan.schema";
import { MatchSession } from "../../matchmaking/schemas/match-session.schema";
import { User } from "../../users/schemas/user.schema";

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, trim: true, index: true })
  chatRoomId!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Clan.name, index: true })
  clanId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: MatchSession.name, index: true })
  matchSessionId?: Types.ObjectId;

  @Prop({ required: true, maxlength: 2000 })
  content!: string;

  @Prop({ type: String, default: "text" })
  messageType!: "text" | "system";

  @Prop()
  editedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ chatRoomId: 1, createdAt: -1 });
ChatMessageSchema.index({ senderId: 1, createdAt: -1 });
ChatMessageSchema.index({ clanId: 1, createdAt: -1 });
ChatMessageSchema.index({ matchSessionId: 1, createdAt: -1 });
