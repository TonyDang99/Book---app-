import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "expo-router";

import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";

import { createHomeStyles as createStyles } from "../../assets/styles/books.styles";
import { fetchApi } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";
import ThemeToggle from "../../components/ThemeToggle";
import useTheme from "../../hooks/useTheme";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { token } = useAuthStore();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const data = await fetchApi(`/books?page=${pageNum}&limit=2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // todo fix it later
      // setBooks((prevBooks) => [...prevBooks, ...data.books]);

      const uniqueBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(new Set([...books, ...data.books].map((book) => book._id))).map((id) =>
              [...books, ...data.books].find((book) => book._id === id)
            );

      setBooks(uniqueBooks);

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching books", error);
    } finally {
      if (refresh) {
        await sleep(800);
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={styles.bookCard}
    >
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Pressable
            onPress={() => router.push(`/user/${item.user._id}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.user.username}'s profile`}
          >
            <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          </Pressable>
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <Pressable
        style={styles.bookImageContainer}
        onPress={() => router.push(`/book/${item._id}`)}
      >
        <Image source={item.image} style={styles.bookImage} contentFit="cover" />
      </Pressable>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : colors.textSecondary}
          style={styles.ratingStar}
        />
      );
    }
    return stars;
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, styles.headerTitleWithToggle]}>
                BookWorm 
              </Text>
              <ThemeToggle />
            </View>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No recommendations yet
            </Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
      />
    </View>
  );
}
