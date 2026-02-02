import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChatModule } from "../chat/chat.module";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { PresenceService } from "./presence.service";

@Module({
  imports: [AuthModule, ChatModule],
  providers: [RealtimeGateway, RealtimeService, PresenceService],
  exports: [RealtimeService]
})
export class RealtimeModule {}
