import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RealtimeModule } from "../realtime/realtime.module";
import { MatchmakingController } from "./matchmaking.controller";
import { MatchmakingService } from "./matchmaking.service";
import { MatchRequest, MatchRequestSchema } from "./schemas/match-request.schema";
import { MatchSession, MatchSessionSchema } from "./schemas/match-session.schema";
import { MatchingService } from "./matching.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchRequest.name, schema: MatchRequestSchema },
      { name: MatchSession.name, schema: MatchSessionSchema }
    ]),
    forwardRef(() => RealtimeModule)
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingService, MatchingService],
  exports: [MatchmakingService, MongooseModule]
})
export class MatchmakingModule {}
