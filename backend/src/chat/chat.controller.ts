import {
  Controller,
  Get,
  Param,
  Query,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { ChatService } from "./chat.service";
import { GetChatMessagesDto } from "./dto/get-chat-messages.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("health")
  getHealth() {
    return this.chatService.getHealth();
  }

  @Get("rooms/:roomId/messages")
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @CurrentUser() user: AuthUser,
    @Param("roomId") roomId: string,
    @Query() query: GetChatMessagesDto
  ) {
    const canJoin = await this.chatService.canJoinRoom(user.sub, roomId);
    if (!canJoin) {
      throw new UnauthorizedException("Not allowed to view this room.");
    }

    return this.chatService.getMessages(roomId, query.limit, query.before);
  }
}


