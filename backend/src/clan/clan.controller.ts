import {
  Body,
  Controller,
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
import { ClanService } from "./clan.service";
import { CreateClanDto } from "./dto/create-clan.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { KickMemberDto } from "./dto/kick-member.dto";
import { UpdateClanRoleDto } from "./dto/update-clan-role.dto";
import { CreateClanEventDto } from "./dto/create-clan-event.dto";

@Controller("clans")
export class ClanController {
  constructor(private readonly clanService: ClanService) {}

  @Get("health")
  getHealth() {
    return this.clanService.getHealth();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createClan(@CurrentUser() user: AuthUser, @Body() payload: CreateClanDto) {
    return this.clanService.createClan(user.sub, payload);
  }

  @Post(":clanId/invite")
  @UseGuards(JwtAuthGuard)
  inviteMember(
    @CurrentUser() user: AuthUser,
    @Param("clanId") clanId: string,
    @Body() payload: InviteMemberDto
  ) {
    return this.clanService.inviteMember(clanId, user.sub, payload);
  }

  @Post(":clanId/join")
  @UseGuards(JwtAuthGuard)
  joinClan(@CurrentUser() user: AuthUser, @Param("clanId") clanId: string) {
    return this.clanService.joinClan(clanId, user.sub);
  }

  @Post(":clanId/leave")
  @UseGuards(JwtAuthGuard)
  leaveClan(@CurrentUser() user: AuthUser, @Param("clanId") clanId: string) {
    return this.clanService.leaveClan(clanId, user.sub);
  }

  @Post(":clanId/kick")
  @UseGuards(JwtAuthGuard)
  kickMember(
    @CurrentUser() user: AuthUser,
    @Param("clanId") clanId: string,
    @Body() payload: KickMemberDto
  ) {
    return this.clanService.kickMember(clanId, user.sub, payload.userId);
  }

  @Patch(":clanId/role")
  @UseGuards(JwtAuthGuard)
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param("clanId") clanId: string,
    @Body() payload: UpdateClanRoleDto
  ) {
    return this.clanService.updateMemberRole(clanId, user.sub, payload);
  }

  @Post(":clanId/events")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createEvent(
    @CurrentUser() user: AuthUser,
    @Param("clanId") clanId: string,
    @Body() payload: CreateClanEventDto
  ) {
    return this.clanService.createEvent(clanId, user.sub, payload);
  }

  @Get(":clanId/events")
  @UseGuards(JwtAuthGuard)
  listEvents(
    @CurrentUser() user: AuthUser,
    @Param("clanId") clanId: string
  ) {
    return this.clanService.listEvents(clanId, user.sub);
  }
}
