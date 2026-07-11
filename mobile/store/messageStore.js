import { create } from "zustand";

import { fetchApi } from "../lib/api";

export const useMessageStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount: Math.max(0, unreadCount || 0) }),
  fetchUnreadCount: async (token) => {
    if (!token) {
      set({ unreadCount: 0 });
      return 0;
    }

    try {
      const data = await fetchApi("/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ unreadCount: data.unreadCount || 0 });
      return data.unreadCount || 0;
    } catch (error) {
      console.log("Failed to fetch unread messages", error.message);
      return null;
    }
  },
}));
