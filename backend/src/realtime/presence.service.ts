import { Injectable } from "@nestjs/common";

@Injectable()
export class PresenceService {
  private readonly connections = new Map<string, Set<string>>();

  addConnection(userId: string, socketId: string): boolean {
    const existing = this.connections.get(userId) ?? new Set<string>();
    const wasOffline = existing.size === 0;
    existing.add(socketId);
    this.connections.set(userId, existing);
    return wasOffline;
  }

  removeConnection(userId: string, socketId: string): boolean {
    const existing = this.connections.get(userId);
    if (!existing) {
      return false;
    }
    existing.delete(socketId);
    if (existing.size === 0) {
      this.connections.delete(userId);
      return true;
    }
    return false;
  }

  isOnline(userId: string): boolean {
    return (this.connections.get(userId)?.size ?? 0) > 0;
  }

  getStatusSnapshot(userIds: string[]): Array<{ userId: string; status: "online" | "offline" }> {
    return userIds.map((userId) => ({
      userId,
      status: this.isOnline(userId) ? "online" : "offline"
    }));
  }
}
