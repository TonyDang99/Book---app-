import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [expandedReplyThreadIds, setExpandedReplyThreadIds] = useState(() => new Set());
  const scrollViewRef = useRef(null);
  const commentInputRef = useRef(null);
  const activeReplyCommentRef = useRef(null);

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

  const scrollCommentIntoView = useCallback((commentRef) => {
    activeReplyCommentRef.current = commentRef;
    setTimeout(() => {
      const commentNode = findNodeHandle(commentRef?.current);
      const responder = scrollViewRef.current?.getScrollResponder?.();
      if (commentNode && responder?.scrollResponderScrollNativeHandleToKeyboard) {
        responder.scrollResponderScrollNativeHandleToKeyboard(commentNode, 90, true);
      }
    }, 180);
  }, []);

  const handleStartReply = useCallback(
    (comment, commentRef) => {
      const username = comment.user?.username || "user";
      setReplyTarget({ id: comment._id, username });
      setCommentText(`@${username} `);
      scrollCommentIntoView(commentRef);
      setTimeout(() => commentInputRef.current?.focus(), 60);
    },
    [scrollCommentIntoView]
  );

  const cancelReply = () => {
    setReplyTarget(null);
    setCommentText("");
    activeReplyCommentRef.current = null;
  };

  useEffect(() => {
    if (Platform.OS !== "ios") return undefined;

    const moveComposerAboveKeyboard = (event) => {
      Keyboard.scheduleLayoutAnimation?.(event);
      setKeyboardInset(Math.max(0, event.endCoordinates?.height || 0));
      if (activeReplyCommentRef.current) scrollCommentIntoView(activeReplyCommentRef.current);
    };
    const resetKeyboardInset = (event) => {
      Keyboard.scheduleLayoutAnimation?.(event);
      setKeyboardInset(0);
    };

    const frameSubscription = Keyboard.addListener(
      "keyboardWillChangeFrame",
      moveComposerAboveKeyboard
    );
    const hideSubscription = Keyboard.addListener("keyboardWillHide", resetKeyboardInset);

    return () => {
      frameSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollCommentIntoView]);

  const handleCommentUpdate = (updatedComment) => {
    const updateInThread = (thread) =>
      thread.map((comment) => {
        if (comment._id === updatedComment._id) {
          return { ...comment, ...updatedComment, replies: comment.replies || [] };
        }

        return {
          ...comment,
          replies: updateInThread(comment.replies || []),
        };
      });

    setComments((prev) => updateInThread(prev));
  };

  const handleReplyAdded = (parentCommentId, reply) => {
    const addReplyToThread = (thread) =>
      thread.map((comment) => {
        if (comment._id === parentCommentId) {
          return { ...comment, replies: [...(comment.replies || []), reply] };
        }

        return {
          ...comment,
          replies: addReplyToThread(comment.replies || []),
        };
      });

    setComments((prev) => addReplyToThread(prev));
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (replyTarget && trimmed === `@${replyTarget.username}`) return;

    try {
      setSubmitting(true);
      const endpoint = replyTarget
        ? `/books/${bookId}/comments/${replyTarget.id}/replies`
        : `/books/${bookId}/comments`;
      const newComment = await fetchApi(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      if (replyTarget) {
        handleReplyAdded(replyTarget.id, newComment);
        setExpandedReplyThreadIds((current) => new Set(current).add(replyTarget.id));
      } else {
        setComments((prev) => [newComment, ...prev]);
      }
      setCommentText("");
      setReplyTarget(null);
      activeReplyCommentRef.current = null;
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
  const countComments = (thread) =>
    thread.reduce((total, comment) => total + 1 + countComments(comment.replies || []), 0);
  const commentCount = countComments(comments);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
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
          <Text style={styles.commentsHeader}>Comments ({commentCount})</Text>

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
                onStartReply={handleStartReply}
                expandedReplyThreadIds={expandedReplyThreadIds}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.commentComposerDock,
          {
            marginBottom: Platform.OS === "ios" ? keyboardInset : 0,
            paddingBottom:
              Platform.OS === "ios" && keyboardInset === 0 ? Math.max(insets.bottom, 10) : 10,
          },
        ]}
      >
        {replyTarget && (
          <View style={styles.replyingToRow}>
            <View style={styles.replyingToTextWrap}>
              <Ionicons name="return-down-forward" size={14} color={colors.primary} />
              <Text style={styles.replyingToText} numberOfLines={1}>
                Replying to <Text style={styles.replyingToUsername}>@{replyTarget.username}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelReplyButton}
              onPress={cancelReply}
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.commentComposerRow}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder={replyTarget ? `Reply to @${replyTarget.username}...` : "Write a comment..."}
            placeholderTextColor={colors.placeholderText}
            value={commentText}
            onChangeText={setCommentText}
            onFocus={() => {
              if (activeReplyCommentRef.current) {
                scrollCommentIntoView(activeReplyCommentRef.current);
              }
            }}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() ||
                submitting ||
                (replyTarget && commentText.trim() === `@${replyTarget.username}`)) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={
              !commentText.trim() ||
              submitting ||
              Boolean(replyTarget && commentText.trim() === `@${replyTarget.username}`)
            }
            accessibilityRole="button"
            accessibilityLabel={replyTarget ? "Post reply" : "Post comment"}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
