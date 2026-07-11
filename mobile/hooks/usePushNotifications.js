import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import { PUSH_TOKEN_STORAGE_KEY } from "../constants/notifications";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { useMessageStore } from "../store/messageStore";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const registerForPushNotifications = async (authToken) => {
  if (Platform.OS === "web") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("activity", {
      name: "Activity",
      description: "Comments, replies, reactions, and new followers",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#e17055",
      sound: "default",
      showBadge: true,
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;
  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }
  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("Push notifications require an EAS projectId in the Expo app configuration.");
    return null;
  }

  if (!Device.isDevice) {
    console.log("Registering push notifications on a simulator or emulator.");
  }

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  await fetchApi("/notifications/push-token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pushToken: expoPushToken }),
  });
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, expoPushToken);

  return expoPushToken;
};

export default function usePushNotifications() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const fetchUnreadMessages = useMessageStore((state) => state.fetchUnreadCount);
  const setUnreadMessages = useMessageStore((state) => state.setUnreadCount);
  const processedResponseId = useRef(null);

  const syncApplicationBadge = useCallback(async (count) => {
    if (Platform.OS === "web" || count === null) return;
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.log("Failed to update notification badge", error.message);
    }
  }, []);

  const handleNotificationResponse = useCallback(
    async (response) => {
      const request = response?.notification?.request;
      const responseId = request?.identifier;
      if (!request || processedResponseId.current === responseId) return;
      processedResponseId.current = responseId;

      const { notificationId, route } = request.content.data || {};
      if (notificationId && token) {
        try {
          const data = await fetchApi(`/notifications/${notificationId}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnreadCount(data.unreadCount);
          await syncApplicationBadge(data.unreadCount);
        } catch (error) {
          console.log("Failed to mark opened notification as read", error.message);
        }
      }

      if (typeof route === "string" && route.startsWith("/")) {
        router.push(route);
      }
    },
    [router, setUnreadCount, syncApplicationBadge, token]
  );

  useEffect(() => {
    if (!token || !user) {
      setUnreadCount(0);
      setUnreadMessages(0);
      return undefined;
    }

    fetchUnreadCount(token).then(syncApplicationBadge);
    fetchUnreadMessages(token);
    registerForPushNotifications(token).catch((error) => {
      console.log("Push notification registration failed", error.message);
    });

    if (Platform.OS === "web") return undefined;

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      fetchUnreadCount(token).then(syncApplicationBadge);
      fetchUnreadMessages(token);
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    Notifications.getLastNotificationResponseAsync()
      .then(handleNotificationResponse)
      .catch((error) => console.log("Failed to read notification response", error.message));

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [
    fetchUnreadCount,
    fetchUnreadMessages,
    handleNotificationResponse,
    setUnreadCount,
    setUnreadMessages,
    syncApplicationBadge,
    token,
    user,
  ]);
}
