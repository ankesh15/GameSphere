import { create } from "zustand";
import apiClient from "../api/http";

export interface Notification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    username: string;
  };
  type: "friend_request" | "team_invitation" | "tournament_invitation" | "tournament_update" | "chat_message" | "clan_invitation" | "match_reminder" | "achievement_unlock" | "ai_recommendation" | "system_announcement";
  title: string;
  content: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchNotifications: (page?: number, isRefresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  triggerMockNotification: (type: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  loadingMore: false,
  error: null,
  page: 1,
  totalPages: 1,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  fetchNotifications: async (page = 1, isRefresh = false) => {
    if (isRefresh) {
      set({ loading: true, error: null });
    } else {
      set({ loading: page === 1, loadingMore: page > 1, error: null });
    }

    try {
      const response = await apiClient.get<{
        items: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/notifications?page=${page}&limit=10`);

      const newItems = response.data.items;
      set((state) => ({
        notifications: page === 1 ? newItems : [...state.notifications, ...newItems],
        page: response.data.page,
        totalPages: response.data.totalPages,
        loading: false,
        loadingMore: false
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch notifications",
        loading: false,
        loadingMore: false
      });
    }
  },

  loadMore: async () => {
    const { page, totalPages, loadingMore, fetchNotifications } = get();
    if (page < totalPages && !loadingMore) {
      await fetchNotifications(page + 1);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
      set({ unreadCount: response.data.count });
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  },

  markAsRead: async (id) => {
    const previousNotifications = [...get().notifications];
    const previousUnreadCount = get().unreadCount;

    // Optimistic Update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));

    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      // Revert on error
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount
      });
    }
  },

  markAllAsRead: async () => {
    const previousNotifications = [...get().notifications];
    const previousUnreadCount = get().unreadCount;

    // Optimistic Update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0
    }));

    try {
      await apiClient.post("/notifications/mark-all-read");
    } catch (err) {
      // Revert on error
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount
      });
    }
  },

  deleteNotification: async (id) => {
    const previousNotifications = [...get().notifications];
    const previousUnreadCount = get().unreadCount;
    const target = previousNotifications.find((n) => n._id === id);
    const wasUnread = target ? !target.isRead : false;

    // Optimistic Update
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    }));

    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (err) {
      // Revert on error
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount
      });
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Avoid duplicate keys
      const exists = state.notifications.some((n) => n._id === notification._id);
      if (exists) return {};

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
      };
    });
  },

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  triggerMockNotification: async (type) => {
    try {
      await apiClient.post("/notifications/trigger-mock", { type });
    } catch (err) {
      console.error("Failed to trigger mock notification", err);
    }
  }
}));
