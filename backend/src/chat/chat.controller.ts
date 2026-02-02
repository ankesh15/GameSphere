import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { ChatService } from "./chat.service";
import { SendChatMessageDto } from "./dto/send-chat-message.dto";
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

  @Post("rooms/:roomId/messages")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param("roomId") roomId: string,
    @Body() payload: SendChatMessageDto
  ) {
    const canJoin = await this.chatService.canJoinRoom(user.sub, roomId);
    if (!canJoin) {
      throw new UnauthorizedException("Not allowed to post in this room.");
    }

    return this.chatService.createMessage(user.sub, {
      roomId,
      content: payload.content
    });
  }
}
