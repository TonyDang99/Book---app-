import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchApi } from "../lib/api";
import { PUSH_TOKEN_STORAGE_KEY } from "../constants/notifications";
import { useNotificationStore } from "./notificationStore";
import { useMessageStore } from "./messageStore";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const data = await fetchApi("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!data?.token || !data?.user) throw new Error("Server did not return auth data");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (username, password) => {
    set({ isLoading: true });

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!data?.token || !data?.user) throw new Error("Server did not return auth data");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    let storedToken = null;
    let storedUser = null;

    try {
      storedToken = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      storedUser = userJson ? JSON.parse(userJson) : null;

      if (!storedToken || !storedUser) {
        await AsyncStorage.multiRemove(["token", "user"]);
        set({ token: null, user: null });
        return;
      }

      // Do not restore an expired/revoked token and let every data screen fail
      // independently. Validate the persisted session before mounting the app.
      await fetchApi("/users/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      set({ token: storedToken, user: storedUser });
    } catch (error) {
      console.log("Auth check failed", error);

      if (error.status === 401 || !storedToken || !storedUser) {
        await AsyncStorage.multiRemove(["token", "user"]);
        set({ token: null, user: null });
      } else {
        // Preserve the session during a temporary network outage so retrying
        // does not require the user to sign in again.
        set({ token: storedToken, user: storedUser });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    const token = get().token;
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token && pushToken) {
      try {
        await fetchApi("/notifications/push-token", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pushToken }),
        });
        await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      } catch (error) {
        console.log("Failed to unregister push notifications", error.message);
      }
    }

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    useNotificationStore.getState().setUnreadCount(0);
    useMessageStore.getState().setUnreadCount(0);
    set({ token: null, user: null });
  },

  updateProfileImage: async (imageDataUrl) => {
    const token = get().token;
    if (!token) throw new Error("You must be logged in to update your profile");

    const data = await fetchApi("/auth/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageDataUrl }),
    });

    if (!data?.user) throw new Error("Server did not return updated user data");

    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user });

    return { success: true };
  },
}));
