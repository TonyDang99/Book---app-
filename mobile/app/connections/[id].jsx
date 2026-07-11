import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import createStyles from "../../assets/styles/profile.styles";
import Loader from "../../components/Loader";
import useTheme from "../../hooks/useTheme";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export default function Connections() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [users, setUsers] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedConnections = useRef(false);

  const userId = Array.isArray(id) ? id[0] : id;
  const connectionType = (Array.isArray(type) ? type[0] : type) === "following"
    ? "following"
    : "followers";
  const title = connectionType === "following" ? "Following" : "Followers";

  const fetchConnections = useCallback(
    async (isRefreshing = false) => {
      if (!userId) return;

      try {
        if (isRefreshing) setRefreshing(true);
        else if (!hasLoadedConnections.current) setLoading(true);

        const data = await fetchApi(`/users/${userId}/${connectionType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data.users || []);
        setOwner(data.owner);
        hasLoadedConnections.current = true;
      } catch (error) {
        console.error("Error fetching connections:", error);
        Alert.alert("Error", error.message || `Failed to load ${title.toLowerCase()}`);
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [connectionType, title, token, userId]
  );

  useFocusEffect(useCallback(() => {
    fetchConnections();
  }, [fetchConnections]));

  const renderUser = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.connectionItem, pressed && styles.connectionItemPressed]}
      onPress={() => router.push(`/user/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.username}'s profile`}
    >
      <Image source={{ uri: item.profileImage }} style={styles.connectionAvatar} />
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionUsername}>{item.username}</Text>
        <Text style={styles.connectionHint}>
          {item.isCurrentUser ? "Your profile" : "View profile"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.connectionsScreen}>
      <View style={styles.publicProfileNavigation}>
        <TouchableOpacity
          style={styles.publicProfileBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.connectionsTitleWrap}>
          <Text style={styles.publicProfileNavigationTitle}>{title}</Text>
          {owner?.username && (
            <Text style={styles.connectionsSubtitle} numberOfLines={1}>
              {owner.username}
            </Text>
          )}
        </View>
        <View style={styles.publicProfileNavigationSpacer} />
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.connectionsList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchConnections(true)}
        ListEmptyComponent={
          <View style={styles.connectionsEmpty}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.connectionsEmptyTitle}>No {title.toLowerCase()} yet</Text>
            <Text style={styles.connectionsEmptyText}>
              {connectionType === "followers"
                ? "People who follow this account will appear here."
                : "Accounts followed by this user will appear here."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
