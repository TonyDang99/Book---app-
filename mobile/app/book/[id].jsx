import { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import createStyles from "../../assets/styles/detail.styles";
import useTheme from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { fetchApi } from "../../lib/api";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";
import CommentItem from "../../components/CommentItem";

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const bookId = Array.isArray(id) ? id[0] : id;

  const fetchBookDetails = useCallback(async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      const [bookData, commentsData] = await Promise.all([
        fetchApi(`/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchApi(`/books/${bookId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBook(bookData);
      setComments(commentsData);
    } catch (error) {
      console.log("Error fetching book details", error);
      Alert.alert("Error", error.message || "Failed to load book details");
    } finally {
      setLoading(false);
    }
  }, [bookId, token]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleCommentUpdate = (updatedComment) => {
    setComments((prev) =>
      prev.map((comment) => (comment._id === updatedComment._id ? updatedComment : comment))
    );
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      const newComment = await fetchApi(`/books/${bookId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color={i <= rating ? "#f4b400" : colors.textSecondary}
          style={{ marginRight: 4 }}
        />
      );
    }
    return stars;
  };

  if (loading) return <Loader />;

  if (!book) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>Book not found</Text>
        </View>
      </View>
    );
  }

  const recommendationAuthor = book.author?.trim() || book.user?.username || "Unknown Author";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{book.title}</Text>
        <View style={styles.authorRow}>
          {book.user && (
            <TouchableOpacity
              onPress={() => router.push(`/user/${book.user._id}`)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Open ${recommendationAuthor}'s profile`}
            >
              <Image source={{ uri: book.user.profileImage }} style={styles.authorAvatar} />
            </TouchableOpacity>
          )}
          <Text style={styles.author}>by {recommendationAuthor}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={book.image} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.ratingContainer}>{renderRatingStars(book.rating)}</View>

        <View style={styles.captionCard}>
          <Text style={styles.captionLabel}>Caption</Text>
          <Text style={styles.caption}>{book.caption}</Text>
          {book.user && (
            <Text style={styles.sharedBy}>
              Recommended by {book.user.username} · {formatPublishDate(book.createdAt)}
            </Text>
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments ({comments.length})</Text>

          {comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                bookId={bookId}
                colors={colors}
                styles={styles}
                onUpdate={handleCommentUpdate}
              />
            ))
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.placeholderText}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
