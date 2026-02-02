import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "../users/users.module";
import { TournamentController } from "./tournament.controller";
import { TournamentService } from "./tournament.service";
import { Tournament, TournamentSchema } from "./schemas/tournament.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema }
    ]),
    UsersModule
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [MongooseModule]
})
export class TournamentModule {}
