import { create } from "zustand";

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  reference_id: number | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  // Actions
  startPolling: () => void;
  stopPolling: () => void;
  fetchCount: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  startPolling: () => {
    subscriberCount++;
    if (subscriberCount === 1) {
      get().fetchCount();
      pollingInterval = setInterval(() => get().fetchCount(), 30000);
    }
  },

  stopPolling: () => {
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0 && pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  fetchCount: async () => {
    try {
      const res = await fetch("/api/proxy/notifications/count", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        set({ unreadCount: data.unread ?? 0 });
      }
    } catch {
      // Silently fail - polling will retry
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/proxy/notifications/?limit=15", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const notifications = data.data ?? data ?? [];
        set({ notifications, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      const res = await fetch(`/api/proxy/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch {
      // Silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await fetch("/api/proxy/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }));
      }
    } catch {
      // Silently fail
    }
  },
}));

export default useNotificationStore;
