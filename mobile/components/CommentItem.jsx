import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, View, Text, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { useReactionPicker } from "./ReactionPicker";
import { useAuthStore } from "../store/authStore";
import { fetchApi } from "../lib/api";
import { buildOptimisticReaction } from "../lib/reactions";
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
  targetCommentId,
  onTargetReady,
}) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [reacting, setReacting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const reactionRequestInFlight = useRef(false);
  const selectReactionRef = useRef(null);
  const reactionButtonRef = useRef(null);
  const commentViewRef = useRef(null);
  const reportedAsTarget = useRef(false);
  const targetBorderOpacity = useRef(new Animated.Value(0)).current;
  const reactionActionScale = useRef(new Animated.Value(1)).current;
  const reactionSummaryScale = useRef(new Animated.Value(1)).current;
  const previousReactionSummary = useRef(
    `${comment.totalReactions || 0}:${(comment.topReactions || []).join(",")}`
  );
  const {
    activeCommentId,
    openReactionPicker,
    updateReactionGesture,
    finishReactionGesture,
    cancelReactionGesture,
  } = useReactionPicker();

  const activeReaction = comment.userReaction;
  const replies = comment.replies || [];
  const replyCount = countReplies(replies);
  const repliesVisible =
    expandReplies || showReplies || expandedReplyThreadIds?.has(comment._id);
  const actionLabel = activeReaction ? REACTION_LABEL[activeReaction] : "Like";
  const actionColor = activeReaction ? REACTION_COLOR[activeReaction] : colors.textSecondary;
  const isTargeted = targetCommentId === comment._id;
  const showPicker = activeCommentId === comment._id;

  useEffect(() => {
    if (isTargeted && !reportedAsTarget.current) {
      reportedAsTarget.current = true;
      targetBorderOpacity.stopAnimation();
      targetBorderOpacity.setValue(1);
      onTargetReady?.(commentViewRef);
      const highlightTimer = setTimeout(() => {
        Animated.timing(targetBorderOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000);
      return () => {
        clearTimeout(highlightTimer);
        targetBorderOpacity.stopAnimation();
      };
    } else if (!isTargeted) {
      reportedAsTarget.current = false;
      targetBorderOpacity.setValue(0);
    }
    return undefined;
  }, [isTargeted, onTargetReady, targetBorderOpacity]);

  useEffect(() => {
    const nextSummary = `${comment.totalReactions || 0}:${(comment.topReactions || []).join(",")}`;
    if (previousReactionSummary.current === nextSummary) return;

    previousReactionSummary.current = nextSummary;
    reactionSummaryScale.stopAnimation();
    reactionSummaryScale.setValue(0.82);
    Animated.spring(reactionSummaryScale, {
      toValue: 1,
      speed: 21,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, [comment.topReactions, comment.totalReactions, reactionSummaryScale]);

  const animateReactionAction = useCallback(() => {
    reactionActionScale.stopAnimation();
    reactionActionScale.setValue(0.82);
    Animated.spring(reactionActionScale, {
      toValue: 1,
      speed: 20,
      bounciness: 13,
      useNativeDriver: true,
    }).start();
  }, [reactionActionScale]);

  const handleReaction = useCallback(async (type) => {
    if (reactionRequestInFlight.current) return;

    const previousComment = comment;
    const optimisticComment = buildOptimisticReaction(comment, type);

    try {
      reactionRequestInFlight.current = true;
      setReacting(true);
      onUpdate(optimisticComment);
      animateReactionAction();

      const updated = await fetchApi(`/books/${bookId}/comments/${comment._id}/reactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      onUpdate(updated);
    } catch (error) {
      onUpdate(previousComment);
      console.log("Error reacting to comment", error);
      Alert.alert("Error", error.message || "Failed to react to this comment");
    } finally {
      reactionRequestInFlight.current = false;
      setReacting(false);
    }
  }, [animateReactionAction, bookId, comment, onUpdate, token]);

  selectReactionRef.current = handleReaction;

  const handleQuickReaction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    handleReaction(activeReaction || "like");
  }, [activeReaction, handleReaction]);

  const handleOpenPicker = useCallback(() => {
    if (reactionRequestInFlight.current) return;
    openReactionPicker({
      commentId: comment._id,
      anchorRef: reactionButtonRef,
      activeReaction,
      disabled: reacting,
      onSelect: (type) => selectReactionRef.current?.(type),
    });
  }, [activeReaction, comment._id, openReactionPicker, reacting]);

  const reactionGesture = useMemo(() => {
    const holdAndSlide = Gesture.Pan()
      .activateAfterLongPress(250)
      .maxPointers(1)
      .shouldCancelWhenOutside(false)
      .onStart(() => {
        runOnJS(handleOpenPicker)();
      })
      .onUpdate((event) => {
        runOnJS(updateReactionGesture)(event.absoluteX, event.absoluteY);
      })
      .onEnd((event) => {
        runOnJS(finishReactionGesture)(event.absoluteX, event.absoluteY);
      })
      .onFinalize((_event, success) => {
        if (!success) runOnJS(cancelReactionGesture)();
      });

    const quickTap = Gesture.Tap().maxDuration(300).onEnd((_event, success) => {
      if (success) runOnJS(handleQuickReaction)();
    });

    return Gesture.Exclusive(holdAndSlide, quickTap);
  }, [
    cancelReactionGesture,
    finishReactionGesture,
    handleOpenPicker,
    handleQuickReaction,
    updateReactionGesture,
  ]);

  const handleAccessibilityAction = useCallback(
    (event) => {
      const actionName = event.nativeEvent.actionName;
      if (actionName === "activate") {
        handleQuickReaction();
        return;
      }

      const reaction = actionName.replace(/^reaction-/, "");
      if (REACTION_TYPES.includes(reaction)) handleReaction(reaction);
    },
    [handleQuickReaction, handleReaction]
  );

  const openReplyComposer = () => {
    cancelReactionGesture();
    onStartReply?.(comment, commentViewRef);
  };

  return (
    <View
      ref={commentViewRef}
      style={[
        styles.commentCard,
        isReply && styles.replyCard,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.targetCommentBorder, { opacity: targetBorderOpacity }]}
      />
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
          onPress={showPicker ? cancelReactionGesture : undefined}
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
          <GestureDetector gesture={reactionGesture}>
            <Animated.View
              style={[
                styles.reactionActionWrap,
                { transform: [{ scale: reactionActionScale }] },
              ]}
            >
              <View
                ref={reactionButtonRef}
                collapsable={false}
                hitSlop={8}
                style={[
                  styles.reactionActionButton,
                  showPicker && styles.reactionActionButtonPressed,
                  reacting && styles.reactionActionButtonBusy,
                ]}
                accessible
                accessibilityLabel="React to comment"
                accessibilityHint="Tap to like, or hold and slide to choose a reaction"
                accessibilityRole="button"
                accessibilityState={{ disabled: reacting, busy: reacting, expanded: showPicker }}
                accessibilityActions={[
                  { name: "activate", label: activeReaction ? "Remove reaction" : "Like" },
                  ...REACTION_TYPES.map((type) => ({
                    name: `reaction-${type}`,
                    label: REACTION_LABEL[type],
                  })),
                ]}
                onAccessibilityAction={handleAccessibilityAction}
                onAccessibilityTap={handleQuickReaction}
              >
                {activeReaction ? (
                  <Text style={styles.reactionActionEmoji}>{REACTION_EMOJI[activeReaction]}</Text>
                ) : null}
                <Text style={[styles.reactionActionText, { color: actionColor }]}>{actionLabel}</Text>
              </View>
            </Animated.View>
          </GestureDetector>

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

        {comment.totalReactions > 0 && (
          <Animated.View
            style={[
              styles.reactionSummary,
              { transform: [{ scale: reactionSummaryScale }] },
            ]}
          >
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
          </Animated.View>
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
                  targetCommentId={targetCommentId}
                  onTargetReady={onTargetReady}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
