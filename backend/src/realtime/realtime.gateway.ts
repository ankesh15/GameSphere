import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthUser } from "../auth/types/auth-user";
import { ChatService } from "../chat/chat.service";
import { RealtimeService } from "./realtime.service";
import { PresenceService } from "./presence.service";

type ChatSendPayload = {
  roomId: string;
  content: string;
};

type ChatJoinPayload = {
  roomId: string;
};

type TypingPayload = {
  roomId: string;
  isTyping: boolean;
};

type PresenceSubscribePayload = {
  userIds: string[];
};

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly presenceService: PresenceService,
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  afterInit(): void {
    this.realtimeService.setServer(this.server);
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: this.configService.get<string>("JWT_SECRET", { infer: true })
      });
      client.data.user = payload;
      client.join(this.realtimeService.userRoom(payload.sub));

      const wentOnline = this.presenceService.addConnection(payload.sub, client.id);
      if (wentOnline) {
        this.broadcastPresence(payload.sub, "online");
      }
    } catch (error) {
      this.logger.warn("WebSocket auth failed.");
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const user = client.data.user as AuthUser | undefined;
    if (!user) {
      return;
    }

    const wentOffline = this.presenceService.removeConnection(user.sub, client.id);
    if (wentOffline) {
      this.broadcastPresence(user.sub, "offline");
    }
  }

  @SubscribeMessage("presence.subscribe")
  handlePresenceSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PresenceSubscribePayload
  ) {
    const user = this.requireUser(client);
    const userIds = Array.isArray(payload?.userIds) ? payload.userIds : [];
    userIds.forEach((id) => client.join(this.realtimeService.presenceRoom(id)));
    client.emit("presence.snapshot", {
      requester: user.sub,
      statuses: this.presenceService.getStatusSnapshot(userIds)
    });
  }

  @SubscribeMessage("chat.join")
  async handleChatJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatJoinPayload
  ) {
    const user = this.requireUser(client);
    const roomId = payload?.roomId?.trim();
    if (!roomId) {
      throw new WsException("Missing roomId.");
    }

    const canJoin = await this.chatService.canJoinRoom(user.sub, roomId);
    if (!canJoin) {
      throw new WsException("Not allowed to join this room.");
    }

    client.join(roomId);
    client.emit("chat.joined", { roomId });
  }

  @SubscribeMessage("chat.send")
  async handleChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatSendPayload
  ) {
    const user = this.requireUser(client);
    const roomId = payload?.roomId?.trim();
    const content = payload?.content?.trim();

    if (!roomId || !content) {
      throw new WsException("Invalid message payload.");
    }

    const canSend = await this.chatService.canJoinRoom(user.sub, roomId);
    if (!canSend) {
      throw new WsException("Not allowed to post in this room.");
    }

    const message = await this.chatService.createMessage(user.sub, {
      roomId,
      content
    });

    this.server.to(roomId).emit("chat.message", message);
  }

  @SubscribeMessage("chat.typing")
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload
  ) {
    const user = this.requireUser(client);
    const roomId = payload?.roomId?.trim();
    const isTyping = Boolean(payload?.isTyping);

    if (!roomId) {
      throw new WsException("Missing roomId.");
    }

    const canSend = await this.chatService.canJoinRoom(user.sub, roomId);
    if (!canSend) {
      throw new WsException("Not allowed to post in this room.");
    }

    client.to(roomId).emit("chat.typing", {
      roomId,
      userId: user.sub,
      isTyping
    });
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers?.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
      return header.slice(7);
    }

    return null;
  }

  private requireUser(client: Socket): AuthUser {
    const user = client.data.user as AuthUser | undefined;
    if (!user) {
      throw new WsException("Unauthenticated socket.");
    }
    return user;
  }

  private broadcastPresence(userId: string, status: "online" | "offline"): void {
    this.server
      .to(this.realtimeService.presenceRoom(userId))
      .emit("presence.update", { userId, status });
  }
}
