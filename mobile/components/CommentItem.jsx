import { useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
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

const countReplies = (replies = []) =>
  replies.reduce((total, reply) => total + 1 + countReplies(reply.replies || []), 0);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderTextWithMentions = (text, mentions, styles, onMentionPress) => {
  const mentionedUsers = (mentions || []).filter(
    (mentionedUser) => mentionedUser?.username && (mentionedUser?._id || mentionedUser?.id)
  );
  if (mentionedUsers.length === 0) return text;

  const usersByUsername = new Map(
    mentionedUsers.map((mentionedUser) => [mentionedUser.username.toLowerCase(), mentionedUser])
  );
  const usernames = [...usersByUsername.keys()]
    .sort((first, second) => second.length - first.length)
    .map(escapeRegExp)
    .join("|");
  const mentionPattern = new RegExp(
    `(^|[^\\p{L}\\p{N}_.-])(@?(?:${usernames}))(?=$|[^\\p{L}\\p{N}_.-])`,
    "giu"
  );
  const content = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    const prefix = match[1] || "";
    const mentionStart = match.index + prefix.length;
    const username = match[2].replace(/^@/, "");
    const mentionedUser = usersByUsername.get(username.toLowerCase());

    if (mentionStart > lastIndex) content.push(text.slice(lastIndex, mentionStart));
    content.push(
      <Text
        key={`${mentionedUser._id || mentionedUser.id}-${mentionStart}`}
        style={styles.mentionText}
        onPress={() => onMentionPress(mentionedUser._id || mentionedUser.id)}
        accessibilityRole="link"
        accessibilityLabel={`Open ${mentionedUser.username}'s profile`}
      >
        {mentionedUser.username}
      </Text>
    );
    lastIndex = mentionPattern.lastIndex;
  }

  if (lastIndex < text.length) content.push(text.slice(lastIndex));
  return content.length > 0 ? content : text;
};

export default function CommentItem({
  comment,
  bookId,
  colors,
  styles,
  onUpdate,
  onStartReply,
  expandedReplyThreadIds,
  isReply = false,
  depth = 0,
  expandReplies = false,
}) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const longPressOpenedPicker = useRef(false);
  const commentViewRef = useRef(null);

  const activeReaction = comment.userReaction;
  const replies = comment.replies || [];
  const replyCount = countReplies(replies);
  const repliesVisible =
    expandReplies || showReplies || expandedReplyThreadIds?.has(comment._id);
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

  const openReplyComposer = () => {
    dismissReactionPicker();
    onStartReply?.(comment, commentViewRef);
  };

  return (
    <View ref={commentViewRef} style={[styles.commentCard, isReply && styles.replyCard]}>
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
          onPress={showPicker ? dismissReactionPicker : undefined}
          accessibilityRole={showPicker ? "button" : undefined}
          accessibilityLabel={showPicker ? "Close reaction picker" : undefined}
        >
          <Text style={styles.commentUsername}>{comment.user?.username}</Text>

          <Text style={styles.commentText}>
            {renderTextWithMentions(comment.text, comment.mentions, styles, (mentionedUserId) =>
              router.push(`/user/${mentionedUserId}`)
            )}
          </Text>

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

        {replyCount > 0 && !expandReplies && (
          <Pressable
            onPress={() => setShowReplies((visible) => !visible)}
            style={({ pressed }) => [
              styles.viewRepliesButton,
              pressed && styles.viewRepliesButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: repliesVisible }}
            accessibilityLabel={
              repliesVisible
                ? "Hide replies"
                : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
            }
          >
            <View style={styles.viewRepliesLine} />
            <Ionicons
              name={repliesVisible ? "chevron-up" : "chevron-down"}
              size={15}
              color={colors.textSecondary}
            />
            <Text style={styles.viewRepliesText}>
              {repliesVisible
                ? "Hide replies"
                : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
            </Text>
          </Pressable>
        )}

        {repliesVisible && replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((reply) => (
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
                  onStartReply={onStartReply}
                  expandedReplyThreadIds={expandedReplyThreadIds}
                  isReply
                  depth={depth + 1}
                  expandReplies={repliesVisible}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
