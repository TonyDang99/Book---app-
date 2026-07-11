import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import createStyles from "../../assets/styles/profile.styles";
import { fetchApi } from "../../lib/api";
import { formatMemberSince, formatPublishDate } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import useTheme from "../../hooks/useTheme";
import Loader from "../../components/Loader";

const getUserId = (user) => user?.id || user?._id;

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, user: currentUser } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);

  const userId = Array.isArray(id) ? id[0] : id;

  const fetchProfile = useCallback(
    async (isRefreshing = false) => {
      if (!userId) return;

      try {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        const data = await fetchApi(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data.user);
        setBooks(data.books);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", error.message || "Failed to load this profile");
      } finally {
        if (isRefreshing) setRefreshing(false);
        else setLoading(false);
      }
    },
    [token, userId]
  );

  useEffect(() => {
    const currentUserId = getUserId(currentUser);
    if (userId && currentUserId && userId === currentUserId) {
      router.replace("/profile");
      return;
    }

    fetchProfile();
  }, [currentUser, fetchProfile, router, userId]);

  const handleFollowToggle = async () => {
    if (!profile || updatingFollow) return;

    try {
      setUpdatingFollow(true);
      const followState = await fetchApi(`/users/${userId}/follow`, {
        method: profile.isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile((currentProfile) => ({ ...currentProfile, ...followState }));
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || `Failed to ${profile.isFollowing ? "unfollow" : "follow"} this user`
      );
    } finally {
      setUpdatingFollow(false);
    }
  };

  const renderRatingStars = (rating) => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#f4b400" : colors.textSecondary}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  const renderBook = ({ item }) => (
    <Pressable
      style={styles.bookItem}
      onPress={() => router.push(`/book/${item._id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      <Image source={item.image} style={styles.bookImage} contentFit="cover" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {renderRatingStars(item.rating)}
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>{formatPublishDate(item.createdAt)}</Text>
      </View>
    </Pressable>
  );

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <View style={styles.publicProfileScreen}>
        <TouchableOpacity style={styles.publicProfileBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.publicProfileEmpty}>
          <Ionicons name="person-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.publicProfileScreen}>
      <View style={styles.publicProfileNavigation}>
        <TouchableOpacity
          style={styles.publicProfileBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.publicProfileNavigationTitle}>Profile</Text>
        <View style={styles.publicProfileNavigationSpacer} />
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.publicProfileList}
        refreshing={refreshing}
        onRefresh={() => fetchProfile(true)}
        ListHeaderComponent={
          <View style={styles.publicProfileHeader}>
            <Image source={{ uri: profile.profileImage }} style={styles.publicProfileImage} />
            <Text style={styles.publicProfileUsername}>{profile.username}</Text>
            <Text style={styles.memberSince}>Joined {formatMemberSince(profile.createdAt)}</Text>

            <View style={styles.publicProfileStats}>
              <View style={styles.publicProfileStat}>
                <Text style={styles.publicProfileStatValue}>{profile.followersCount || 0}</Text>
                <Text style={styles.publicProfileStatLabel}>Followers</Text>
              </View>
              <View style={styles.publicProfileStatDivider} />
              <View style={styles.publicProfileStat}>
                <Text style={styles.publicProfileStatValue}>{profile.followingCount || 0}</Text>
                <Text style={styles.publicProfileStatLabel}>Following</Text>
              </View>
              <View style={styles.publicProfileStatDivider} />
              <View style={styles.publicProfileStat}>
                <Text style={styles.publicProfileStatValue}>{books.length}</Text>
                <Text style={styles.publicProfileStatLabel}>Books</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.followButton,
                profile.isFollowing && styles.followingButton,
                updatingFollow && styles.followButtonDisabled,
              ]}
              onPress={handleFollowToggle}
              disabled={updatingFollow}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={profile.isFollowing ? "Unfollow user" : "Follow user"}
            >
              {updatingFollow ? (
                <ActivityIndicator
                  size="small"
                  color={profile.isFollowing ? colors.primary : colors.white}
                />
              ) : (
                <Ionicons
                  name={profile.isFollowing ? "checkmark" : "person-add-outline"}
                  size={18}
                  color={profile.isFollowing ? colors.primary : colors.white}
                />
              )}
              <Text
                style={[
                  styles.followButtonText,
                  profile.isFollowing && styles.followingButtonText,
                ]}
              >
                {profile.isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.publicProfileSectionTitle}>Recommendations</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.publicProfileEmpty}>
            <Ionicons name="book-outline" size={42} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet</Text>
          </View>
        }
        ListFooterComponent={
          refreshing ? <ActivityIndicator style={styles.publicProfileLoader} color={colors.primary} /> : null
        }
      />
    </View>
  );
}
