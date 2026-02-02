import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  async emitToUser(userId: string, event: string, payload: unknown): Promise<void> {
    if (!this.server) {
      this.logger.warn("Realtime server not initialized.");
      return;
    }
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

  async emitToUsers(userIds: string[], event: string, payload: unknown): Promise<void> {
    await Promise.all(userIds.map((id) => this.emitToUser(id, event, payload)));
  }

  emitToRoom(roomId: string, event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn("Realtime server not initialized.");
      return;
    }
    this.server.to(roomId).emit(event, payload);
  }

  userRoom(userId: string): string {
    return `user:${userId}`;
  }

  presenceRoom(userId: string): string {
    return `presence:${userId}`;
  }
}
