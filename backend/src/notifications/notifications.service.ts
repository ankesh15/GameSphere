import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Notification, NotificationDocument } from "./schemas/notification.schema";
import { RealtimeService } from "../realtime/realtime.service";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly realtimeService: RealtimeService
  ) {}

  async create(payload: {
    recipientId: string;
    senderId?: string;
    type: string;
    title: string;
    content: string;
    data?: Record<string, any>;
  }) {
    const notification = await this.notificationModel.create({
      recipientId: new Types.ObjectId(payload.recipientId),
      senderId: payload.senderId ? new Types.ObjectId(payload.senderId) : undefined,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      data: payload.data || {},
      isRead: false
    });

    const populated = await notification.populate({
      path: "senderId",
      select: "username"
    });

    // Emit real-time notification
    await this.realtimeService.emitToUser(
      payload.recipientId,
      "notification.new",
      populated
    );

    // Emit unread count update
    const unreadCount = await this.getUnreadCount(payload.recipientId);
    await this.realtimeService.emitToUser(
      payload.recipientId,
      "notification.unread_count",
      { count: unreadCount }
    );

    return populated;
  }

  async getNotifications(
    userId: string,
    options: { page: number; limit: number; isRead?: boolean }
  ) {
    const query: Record<string, any> = {
      recipientId: new Types.ObjectId(userId)
    };

    if (options.isRead !== undefined) {
      query.isRead = options.isRead;
    }

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .populate({ path: "senderId", select: "username" })
        .exec(),
      this.notificationModel.countDocuments(query)
    ]);

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      isRead: false
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.recipientId.toString() !== userId) {
      throw new ForbiddenException("Cannot modify this notification");
    }

    notification.isRead = true;
    await notification.save();

    // Emit updated unread count
    const unreadCount = await this.getUnreadCount(userId);
    await this.realtimeService.emitToUser(userId, "notification.unread_count", {
      count: unreadCount
    });

    return notification;
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );

    // Emit updated unread count
    await this.realtimeService.emitToUser(userId, "notification.unread_count", {
      count: 0
    });

    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.recipientId.toString() !== userId) {
      throw new ForbiddenException("Cannot delete this notification");
    }

    await notification.deleteOne();

    // Emit updated unread count
    const unreadCount = await this.getUnreadCount(userId);
    await this.realtimeService.emitToUser(userId, "notification.unread_count", {
      count: unreadCount
    });
  }
}
