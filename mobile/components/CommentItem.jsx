import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../store/authStore";
import { fetchApi } from "../lib/api";
import { formatPublishDate } from "../lib/utils";
import {
  REACTION_TYPES,
  REACTION_EMOJI,
  REACTION_LABEL,
  REACTION_COLOR,
} from "../constants/reactions";

export default function CommentItem({
  comment,
  bookId,
  colors,
  styles,
  onUpdate,
  onReplyAdded,
  onReplyFocus,
  isReply = false,
  depth = 0,
}) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const longPressOpenedPicker = useRef(false);
  const replyInputRef = useRef(null);

  const activeReaction = comment.userReaction;
  const actionLabel = activeReaction ? REACTION_LABEL[activeReaction] : "Like";
  const actionColor = activeReaction ? REACTION_COLOR[activeReaction] : colors.textSecondary;

  const handleReaction = async (type) => {
    try {
      setReacting(true);
      const updated = await fetchApi(`/books/${bookId}/comments/${comment._id}/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      onUpdate(updated);
      setShowPicker(false);
    } catch (error) {
      console.log("Error reacting to comment", error);
      Alert.alert("Error", error.message || "Failed to react to this comment");
    } finally {
      setReacting(false);
    }
  };

  const handleQuickReaction = () => {
    if (showPicker) {
      dismissReactionPicker();
      return;
    }

    if (longPressOpenedPicker.current) {
      longPressOpenedPicker.current = false;
      return;
    }

    handleReaction(activeReaction || "like");
  };

  const handleOpenPicker = () => {
    longPressOpenedPicker.current = true;
    setShowPicker(true);
  };

  const dismissReactionPicker = () => {
    longPressOpenedPicker.current = false;
    setShowPicker(false);
  };

  const handleSubmitReply = async () => {
    const trimmedReply = replyText.trim();
    if (!trimmedReply || submittingReply) return;

    try {
      setSubmittingReply(true);
      const reply = await fetchApi(`/books/${bookId}/comments/${comment._id}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedReply }),
      });

      onReplyAdded?.(comment._id, reply);
      setReplyText("");
      setIsReplying(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const openReplyComposer = () => {
    dismissReactionPicker();
    setIsReplying(true);
  };

  return (
    <View style={[styles.commentCard, isReply && styles.replyCard]}>
      <Pressable
        onPress={() => comment.user?._id && router.push(`/user/${comment.user._id}`)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Open ${comment.user?.username || "user"}'s profile`}
      >
        <Image
          source={{ uri: comment.user?.profileImage }}
          style={[styles.commentAvatar, isReply && styles.replyAvatar]}
        />
      </Pressable>

      <View style={styles.commentContent}>
        <Pressable
          onPress={dismissReactionPicker}
          disabled={!showPicker}
          accessibilityRole={showPicker ? "button" : undefined}
          accessibilityLabel={showPicker ? "Close reaction picker" : undefined}
        >
          <Text style={styles.commentUsername}>{comment.user?.username}</Text>

          <Text style={styles.commentText}>{comment.text}</Text>

          <Text style={styles.commentDate}>{formatPublishDate(comment.createdAt)}</Text>
        </Pressable>

        <View style={styles.commentActionsRow}>
          <View style={styles.reactionActionWrap}>
            <Pressable
              onPress={handleQuickReaction}
              onLongPress={handleOpenPicker}
              delayLongPress={250}
              disabled={reacting}
              style={({ pressed }) => [
                styles.reactionActionButton,
                pressed && styles.reactionActionButtonPressed,
              ]}
              accessibilityLabel="React to comment"
              accessibilityHint="Tap to like, or long press to choose a reaction"
              accessibilityRole="button"
            >
              {reacting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : activeReaction ? (
                <Text style={styles.reactionActionEmoji}>{REACTION_EMOJI[activeReaction]}</Text>
              ) : null}
              <Text style={[styles.reactionActionText, { color: actionColor }]}>{actionLabel}</Text>
            </Pressable>

          </View>

          <Pressable
            onPress={openReplyComposer}
            style={({ pressed }) => [
              styles.replyActionButton,
              pressed && styles.reactionActionButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.user?.username || "comment"}`}
          >
            <Ionicons name="return-down-forward-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.replyActionText}>Reply</Text>
          </Pressable>
        </View>

        {showPicker && (
          <View
            style={[
              styles.reactionPicker,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                shadowColor: colors.black,
              },
            ]}
          >
            {REACTION_TYPES.map((type) => {
              const isActive = activeReaction === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => handleReaction(type)}
                  disabled={reacting}
                  style={({ pressed }) => [
                    styles.reactionPickerItem,
                    isActive && styles.reactionPickerItemActive,
                    pressed && styles.reactionPickerItemPressed,
                  ]}
                  accessibilityLabel={REACTION_LABEL[type]}
                  accessibilityRole="button"
                >
                  <Text style={styles.reactionPickerEmoji}>{REACTION_EMOJI[type]}</Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={dismissReactionPicker}
              style={({ pressed }) => [
                styles.reactionPickerClose,
                pressed && styles.reactionPickerItemPressed,
              ]}
              accessibilityLabel="Close reaction picker"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {comment.totalReactions > 0 && (
          <View style={styles.reactionSummary}>
            <View style={styles.reactionIconsRow}>
              {(comment.topReactions || []).slice(0, 3).map((type, index) => (
                <View
                  key={type}
                  style={[
                    styles.reactionBadge,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      marginLeft: index > 0 ? -8 : 0,
                      zIndex: 3 - index,
                    },
                  ]}
                >
                  <Text style={styles.reactionBadgeEmoji}>{REACTION_EMOJI[type]}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
              {comment.totalReactions}
            </Text>
          </View>
        )}

        {isReplying && (
          <View style={styles.replyComposer}>
            <TextInput
              ref={replyInputRef}
              style={styles.replyInput}
              placeholder={`Reply to ${comment.user?.username || "comment"}...`}
              placeholderTextColor={colors.placeholderText}
              value={replyText}
              onChangeText={setReplyText}
              onFocus={() => onReplyFocus?.(replyInputRef)}
              autoFocus
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={handleSubmitReply}
              disabled={!replyText.trim() || submittingReply}
              style={({ pressed }) => [
                styles.replySendButton,
                (!replyText.trim() || submittingReply) && styles.replySendButtonDisabled,
                pressed && styles.replySendButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Post reply"
            >
              {submittingReply ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={16} color={colors.white} />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setReplyText("");
                setIsReplying(false);
              }}
              style={styles.replyCancelButton}
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {(comment.replies || []).length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <View
                key={reply._id}
                style={[styles.replyThread, depth > 0 && styles.nestedReplyThread]}
              >
                <CommentItem
                  comment={reply}
                  bookId={bookId}
                  colors={colors}
                  styles={styles}
                  onUpdate={onUpdate}
                  onReplyAdded={onReplyAdded}
                  onReplyFocus={onReplyFocus}
                  isReply
                  depth={depth + 1}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
