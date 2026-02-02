import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClanController } from "./clan.controller";
import { ClanService } from "./clan.service";
import { Clan, ClanSchema } from "./schemas/clan.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Clan.name, schema: ClanSchema }])
  ],
  controllers: [ClanController],
  providers: [ClanService],
  exports: [MongooseModule]
})
export class ClanModule {}
