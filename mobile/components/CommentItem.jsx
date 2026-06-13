import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../store/authStore";
import { fetchApi } from "../lib/api";
import { formatPublishDate } from "../lib/utils";
import { REACTION_TYPES, REACTION_EMOJI } from "../constants/reactions";

export default function CommentItem({ comment, bookId, colors, styles, onUpdate }) {
  const { token } = useAuthStore();
  const [hovered, setHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [reacting, setReacting] = useState(false);

  const showReactIcon = hovered || showPicker;

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
      setHovered(false);
    } catch (error) {
      console.log("Error reacting to comment", error);
    } finally {
      setReacting(false);
    }
  };

  const handleHoverOut = () => {
    if (!showPicker) setHovered(false);
  };

  return (
    <Pressable
      style={styles.commentCard}
      onHoverIn={() => setHovered(true)}
      onHoverOut={handleHoverOut}
      onPressIn={() => setHovered(true)}
      onPressOut={handleHoverOut}
    >
      <Image source={{ uri: comment.user?.profileImage }} style={styles.commentAvatar} />

      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user?.username}</Text>

        <View style={styles.commentMessageRow}>
          <Text style={[styles.commentText, !showReactIcon && styles.commentTextFull]}>
            {comment.text}
          </Text>

          {showReactIcon && (
            <View style={styles.reactIconSlot}>
              <Pressable
                onPress={() => setShowPicker((prev) => !prev)}
                onHoverIn={() => setHovered(true)}
                disabled={reacting}
                style={({ pressed, hovered: iconHovered }) => [
                  styles.reactSmileButton,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                    opacity: pressed || iconHovered ? 1 : 0.92,
                  },
                ]}
                accessibilityLabel="React to comment"
                accessibilityRole="button"
              >
                {reacting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : comment.userReaction ? (
                  <Text style={styles.reactSmileEmoji}>{REACTION_EMOJI[comment.userReaction]}</Text>
                ) : (
                  <Ionicons name="happy-outline" size={18} color={colors.textSecondary} />
                )}
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
                  onHoverIn={() => setHovered(true)}
                >
                  {REACTION_TYPES.map((type) => {
                    const isActive = comment.userReaction === type;
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
                      >
                        <Text style={styles.reactionPickerEmoji}>{REACTION_EMOJI[type]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={styles.commentDate}>{formatPublishDate(comment.createdAt)}</Text>

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
    </Pressable>
  );
}
