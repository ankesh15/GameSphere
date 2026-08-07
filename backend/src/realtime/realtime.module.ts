import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ChatModule } from "../chat/chat.module";
import { MatchmakingModule } from "../matchmaking/matchmaking.module";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { PresenceService } from "./presence.service";

@Module({
  imports: [AuthModule, ChatModule, forwardRef(() => MatchmakingModule)],
  providers: [RealtimeGateway, RealtimeService, PresenceService],
  exports: [RealtimeService]
})
export class RealtimeModule {}
