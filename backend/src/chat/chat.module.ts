import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "../clan/schemas/clan.schema";
import { MatchSession, MatchSessionSchema } from "../matchmaking/schemas/match-session.schema";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatMessage, ChatMessageSchema } from "./schemas/chat-message.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: MatchSession.name, schema: MatchSessionSchema },
      { name: Clan.name, schema: ClanSchema }
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, MongooseModule]
})
export class ChatModule {}
