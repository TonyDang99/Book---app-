import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoNotifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import createStyles from "../../assets/styles/notifications.styles";
import Loader from "../../components/Loader";
import useTheme from "../../hooks/useTheme";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";

const notificationIcons = {
  follow: "person-add",
  comment: "chatbubble",
  reply: "return-down-forward",
  reaction: "heart",
  message: "chatbubble-ellipses",
};

const formatRelativeTime = (dateString) => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const syncApplicationBadge = (count) => {
  if (Platform.OS !== "web") {
    ExpoNotifications.setBadgeCountAsync(count).catch((error) =>
      console.log("Failed to update notification badge", error.message)
    );
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const hasLoaded = useRef(false);

  const fetchNotifications = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) setRefreshing(true);
        else if (!hasLoaded.current) setLoading(true);

        const data = await fetchApi("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount);
        hasLoaded.current = true;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        Alert.alert("Error", error.message || "Failed to load notifications");
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [setUnreadCount, token]
  );

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      try {
        const data = await fetchApi(`/notifications/${notification._id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount(data.unreadCount);
        syncApplicationBadge(data.unreadCount);
      } catch (error) {
        console.log("Failed to mark notification as read", error.message);
      }
    }

    const actorId = notification.actor?._id;
    if (notification.conversation) router.push(`/chat/${notification.conversation}`);
    else if (notification.book) router.push(`/book/${notification.book}`);
    else if (actorId) router.push(`/user/${actorId}`);
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;

    try {
      setMarkingAll(true);
      await fetchApi("/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      syncApplicationBadge(0);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

  const renderNotification = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.notificationCard,
        !item.isRead && styles.unreadCard,
        pressed && styles.cardPressed,
      ]}
      onPress={() => handleNotificationPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? "" : "Unread notification. "}${item.message}`}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.actor?.profileImage }} style={styles.avatar} />
        <View style={styles.typeBadge}>
          <Ionicons
            name={notificationIcons[item.type] || "notifications"}
            size={12}
            color={colors.white}
          />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnreadNotifications && (
          <Pressable
            onPress={handleMarkAllRead}
            disabled={markingAll}
            style={({ pressed }) => [styles.markAllButton, pressed && styles.markAllButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markAllText}>{markingAll ? "Updating..." : "Mark all read"}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchNotifications(true)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={38} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              Messages, comments, replies, reactions, and new followers will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
