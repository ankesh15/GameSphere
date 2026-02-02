import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { GamerProfilesService } from "./gamer-profiles.service";
import { CreateGamerProfileDto } from "./dto/create-gamer-profile.dto";
import { UpdateGamerProfileDto } from "./dto/update-gamer-profile.dto";
import { LinkGamingAccountDto } from "./dto/link-gaming-account.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";

@Controller("profiles")
@UseGuards(JwtAuthGuard)
export class GamerProfilesController {
  constructor(private readonly profilesService: GamerProfilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProfile(
    @CurrentUser() user: AuthUser,
    @Body() payload: CreateGamerProfileDto
  ) {
    return this.profilesService.createProfile(user.sub, payload);
  }

  @Get("me")
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.profilesService.getProfileByUserId(user.sub);
  }

  @Patch("me")
  updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() payload: UpdateGamerProfileDto
  ) {
    return this.profilesService.updateProfile(user.sub, payload);
  }

  @Patch("me/availability")
  updateAvailability(
    @CurrentUser() user: AuthUser,
    @Body() payload: UpdateAvailabilityDto
  ) {
    return this.profilesService.updateProfile(user.sub, payload);
  }

  @Delete("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyProfile(@CurrentUser() user: AuthUser) {
    await this.profilesService.removeProfile(user.sub);
  }

  @Post("me/accounts")
  linkGamingAccount(
    @CurrentUser() user: AuthUser,
    @Body() payload: LinkGamingAccountDto
  ) {
    return this.profilesService.linkGamingAccount(user.sub, payload);
  }

  @Delete("me/accounts/:provider")
  unlinkGamingAccount(
    @CurrentUser() user: AuthUser,
    @Param("provider") provider: LinkGamingAccountDto["provider"]
  ) {
    return this.profilesService.unlinkGamingAccount(user.sub, provider);
  }
}
