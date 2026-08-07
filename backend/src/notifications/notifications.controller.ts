import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { NotificationsService } from "./notifications.service";

class TriggerMockDto {
  type!: string;
  title?: string;
  content?: string;
  senderId?: string;
  data?: Record<string, any>;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: AuthUser,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("isRead") isRead?: string
  ) {
    let parsedIsRead: boolean | undefined = undefined;
    if (isRead === "true") parsedIsRead = true;
    if (isRead === "false") parsedIsRead = false;

    return this.notificationsService.getNotifications(user.sub, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      isRead: parsedIsRead
    });
  }

  @Get("unread-count")
  async getUnreadCount(@CurrentUser() user: AuthUser) {
    const count = await this.notificationsService.getUnreadCount(user.sub);
    return { count };
  }

  @Patch(":id/read")
  async markAsRead(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Post("mark-all-read")
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    await this.notificationsService.deleteNotification(user.sub, id);
  }

  @Post("trigger-mock")
  @HttpCode(HttpStatus.CREATED)
  async triggerMock(@CurrentUser() user: AuthUser, @Body() payload: TriggerMockDto) {
    const defaultData: Record<string, any> = {};
    if (payload.type === "clan_invitation") {
      defaultData.clanId = "60c72b2f9b1d8b2badcf5e8b";
      defaultData.clanName = "Clan Phoenix";
    } else if (payload.type === "tournament_invitation") {
      defaultData.tournamentId = "60c72b2f9b1d8b2badcf5e8c";
      defaultData.tournamentName = "Saturday Scrims";
    }

    return this.notificationsService.create({
      recipientId: user.sub,
      senderId: payload.senderId,
      type: payload.type,
      title: payload.title || `Mock Notification: ${payload.type}`,
      content: payload.content || `This is a mockup representation for notification type: ${payload.type}`,
      data: { ...defaultData, ...payload.data }
    });
  }
}
