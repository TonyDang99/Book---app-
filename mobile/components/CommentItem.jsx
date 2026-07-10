import { useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { useAuthStore } from "../store/authStore";
import { fetchApi } from "../lib/api";
import { formatPublishDate } from "../lib/utils";
import {
  REACTION_TYPES,
  REACTION_EMOJI,
  REACTION_LABEL,
  REACTION_COLOR,
} from "../constants/reactions";

export default function CommentItem({ comment, bookId, colors, styles, onUpdate }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [reacting, setReacting] = useState(false);
  const longPressOpenedPicker = useRef(false);

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

  return (
    <View style={styles.commentCard}>
      <Pressable
        onPress={() => comment.user?._id && router.push(`/user/${comment.user._id}`)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Open ${comment.user?.username || "user"}'s profile`}
      >
        <Image source={{ uri: comment.user?.profileImage }} style={styles.commentAvatar} />
      </Pressable>

      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user?.username}</Text>

        <Text style={styles.commentText}>{comment.text}</Text>

        <Text style={styles.commentDate}>{formatPublishDate(comment.createdAt)}</Text>

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

            {showPicker && (
              <View
                style={[
                  styles.reactionPicker,
                  {
                    backgroundColor: colors.cardBackground,
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
                        isActive && { backgroundColor: colors.inputBackground },
                        pressed && { transform: [{ scale: 1.15 }] },
                      ]}
                      accessibilityLabel={REACTION_LABEL[type]}
                      accessibilityRole="button"
                    >
                      <Text style={styles.reactionPickerEmoji}>{REACTION_EMOJI[type]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>

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
      </View>
    </View>
  );
}
