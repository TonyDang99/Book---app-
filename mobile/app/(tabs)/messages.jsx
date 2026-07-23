import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { createMessagingStyles as createStyles } from "../../assets/styles/communication.styles";
import Loader from "../../components/Loader";
import useTheme from "../../hooks/useTheme";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useMessageStore } from "../../store/messageStore";

const formatConversationTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function MessagesScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const setUnreadCount = useMessageStore((state) => state.setUnreadCount);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);
  const currentUserId = user?.id || user?._id;

  const fetchConversations = useCallback(
    async (isRefreshing = false, silent = false) => {
      try {
        if (isRefreshing) setRefreshing(true);
        else if (!silent && !hasLoaded.current) setLoading(true);

        const data = await fetchApi("/messages/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(data.conversations || []);
        setUnreadCount(data.unreadCount);
        hasLoaded.current = true;
      } catch (error) {
        if (!silent) Alert.alert("Error", error.message || "Failed to load conversations");
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [setUnreadCount, token]
  );

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const interval = setInterval(() => fetchConversations(false, true), 5000);
      return () => clearInterval(interval);
    }, [fetchConversations])
  );

  const renderConversation = ({ item }) => {
    const sentByMe = item.lastSender?.toString() === currentUserId?.toString();
    const preview = item.lastMessage
      ? `${sentByMe ? "You: " : ""}${item.lastMessage}`
      : "Start a conversation";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.conversationCard,
          pressed && styles.conversationCardPressed,
        ]}
        onPress={() => router.push(`/chat/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${item.otherUser?.username || "user"}`}
      >
        <Image source={{ uri: item.otherUser?.profileImage }} style={styles.conversationAvatar} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationTopRow}>
            <Text style={styles.conversationUsername} numberOfLines={1}>
              {item.otherUser?.username || "Unknown user"}
            </Text>
            <Text style={styles.conversationTime}>{formatConversationTime(item.lastMessageAt)}</Text>
          </View>
          <View style={styles.conversationPreviewRow}>
            <Text
              style={[styles.conversationPreview, item.unreadCount > 0 && styles.unreadPreview]}
              numberOfLines={1}
            >
              {preview}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchConversations(true)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Visit someone’s profile and tap Message to start a conversation.
            </Text>
          </View>
        }
      />
    </View>
  );
}
