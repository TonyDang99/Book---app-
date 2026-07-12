import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export default function MentionSuggestions({ users, query, onSelect, colors, styles }) {
  return (
    <View style={styles.mentionPopup}>
      <View style={styles.mentionPopupHeader}>
        <Ionicons name="people-outline" size={15} color={colors.primary} />
        <Text style={styles.mentionPopupTitle}>Mention someone you follow</Text>
      </View>

      {users.length > 0 ? (
        users.map((user) => (
          <Pressable
            key={user.id || user._id}
            onPress={() => onSelect(user)}
            style={({ pressed }) => [
              styles.mentionOption,
              pressed && styles.mentionOptionPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Mention ${user.username}`}
          >
            <Image source={{ uri: user.profileImage }} style={styles.mentionAvatar} />
            <View style={styles.mentionOptionText}>
              <Text style={styles.mentionUsername}>{user.username}</Text>
              <Text style={styles.mentionFollowingLabel}>Following</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <Text style={styles.mentionEmptyText}>
          {query ? `No followed users match “${query}”.` : "Follow someone to mention them."}
        </Text>
      )}
    </View>
  );
}
