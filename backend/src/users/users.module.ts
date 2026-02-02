import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { GamerProfile, GamerProfileSchema } from "./schemas/gamer-profile.schema";
import { User, UserSchema } from "./schemas/user.schema";
import { GamerProfilesController } from "./gamer-profiles.controller";
import { GamerProfilesService } from "./gamer-profiles.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: GamerProfile.name, schema: GamerProfileSchema }
    ])
  ],
  controllers: [UsersController, GamerProfilesController],
  providers: [UsersService, GamerProfilesService],
  exports: [GamerProfilesService, MongooseModule]
})
export class UsersModule {}
