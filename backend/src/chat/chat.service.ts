import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Clan, ClanDocument } from "../clan/schemas/clan.schema";
import { MatchSession, MatchSessionDocument } from "../matchmaking/schemas/match-session.schema";
import { ChatMessage, ChatMessageDocument } from "./schemas/chat-message.schema";

type CreateMessageInput = {
  roomId: string;
  content: string;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatModel: Model<ChatMessageDocument>,
    @InjectModel(MatchSession.name)
    private readonly matchSessionModel: Model<MatchSessionDocument>,
    @InjectModel(Clan.name)
    private readonly clanModel: Model<ClanDocument>
  ) {}

  getHealth() {
    return {
      status: "ok",
      module: "chat",
      timestamp: new Date().toISOString()
    };
  }

  async canJoinRoom(userId: string, roomId: string): Promise<boolean> {
    const parsed = this.parseRoom(roomId);
    if (!parsed) {
      return false;
    }

    if (parsed.type === "match") {
      const session = await this.matchSessionModel.findById(parsed.id);
      if (!session) {
        return false;
      }
      return session.playerIds.some((id) => id.toString() === userId);
    }

    const clan = await this.clanModel.findById(parsed.id);
    if (!clan) {
      return false;
    }
    const isOwner = clan.ownerId.toString() === userId;
    const isMemberByIds = clan.memberIds.some((id) => id.toString() === userId);
    const isMemberByRoles = clan.members?.some(
      (member) => member.userId.toString() === userId
    );
    return isOwner || isMemberByIds || Boolean(isMemberByRoles);
  }

  async createMessage(userId: string, payload: CreateMessageInput) {
    const parsed = this.parseRoom(payload.roomId);
    if (!parsed) {
      throw new NotFoundException("Chat room not found.");
    }

    const document = await this.chatModel.create({
      chatRoomId: payload.roomId,
      senderId: new Types.ObjectId(userId),
      content: payload.content.trim(),
      messageType: "text",
      clanId: parsed.type === "clan" ? parsed.objectId : undefined,
      matchSessionId: parsed.type === "match" ? parsed.objectId : undefined
    });

    return this.toMessageResponse(document);
  }

  async getMessages(roomId: string, limit = 50, before?: string) {
    const query: Record<string, unknown> = { chatRoomId: roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await this.chatModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return messages.map((message) => this.toMessageResponse(message)).reverse();
  }

  private parseRoom(roomId: string):
    | { type: "match" | "clan"; id: string; objectId: Types.ObjectId }
    | null {
    const [prefix, id] = roomId.split(":");
    if (!id || !Types.ObjectId.isValid(id)) {
      return null;
    }
    if (prefix === "match") {
      return { type: "match", id, objectId: new Types.ObjectId(id) };
    }
    if (prefix === "clan") {
      return { type: "clan", id, objectId: new Types.ObjectId(id) };
    }
    return null;
  }

  private toMessageResponse(message: ChatMessageDocument) {
    const createdAt = (message as { createdAt?: Date }).createdAt;
    return {
      id: message._id.toString(),
      roomId: message.chatRoomId,
      senderId: message.senderId.toString(),
      content: message.content,
      messageType: message.messageType,
      createdAt: createdAt?.toISOString() ?? new Date().toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null
    };
  }
}
