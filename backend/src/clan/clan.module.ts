import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClanController } from "./clan.controller";
import { ClanService } from "./clan.service";
import { Clan, ClanSchema } from "./schemas/clan.schema";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Clan.name, schema: ClanSchema }]),
    NotificationsModule
  ],
  controllers: [ClanController],
  providers: [ClanService],
  exports: [MongooseModule]
})
export class ClanModule {}
