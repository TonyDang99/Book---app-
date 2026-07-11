import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import createStyles from "../assets/styles/profile.styles";
import { formatMemberSince } from "../lib/utils";
import useTheme from "../hooks/useTheme";

const hasPhotoAccess = (permission) =>
  permission?.granted || permission?.accessPrivileges === "limited";

const showSettingsAlert = () => {
  Alert.alert(
    "Photo Permission Required",
    "Photo access is turned off. Open Settings and allow photo access to change your profile picture.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
};

export default function ProfileHeader({
  followersCount = 0,
  followingCount = 0,
  onFollowersPress,
  onFollowingPress,
}) {
  const { user, updateProfileImage } = useAuthStore();
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  if (!user) return null;

  const avatarUri = previewUri || user.profileImage;

  const pickAvatar = async () => {
    if (isUploading) return;

    try {
      if (Platform.OS !== "web") {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!hasPhotoAccess(permission) && permission.canAskAgain) {
          permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!hasPhotoAccess(permission)) {
          if (!permission.canAskAgain) {
            showSettingsAlert();
          } else {
            Alert.alert(
              "Photo Permission Required",
              "Allow photo access so you can change your profile picture."
            );
          }
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setPreviewUri(asset.uri);
      setIsUploading(true);

      let base64 = asset.base64;
      if (!base64) {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "base64",
        });
      }

      const uriParts = asset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${base64}`;

      await updateProfileImage(imageDataUrl);
      setPreviewUri(null);
    } catch (error) {
      console.error("Error updating profile image:", error);
      setPreviewUri(null);
      Alert.alert("Error", error.message || "Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileIdentityRow}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickAvatar}
          activeOpacity={0.8}
          disabled={isUploading}
        >
          <Image source={{ uri: avatarUri }} style={styles.profileImage} />

          {isUploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={colors.white} />
            </View>
          ) : (
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.memberSince}>🗓️ Joined {formatMemberSince(user.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.profileStats}>
        <TouchableOpacity
          style={styles.profileStatButton}
          onPress={onFollowersPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${followersCount} followers`}
        >
          <Text style={styles.profileStatValue}>{followersCount}</Text>
          <Text style={styles.profileStatLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.profileStatDivider} />
        <TouchableOpacity
          style={styles.profileStatButton}
          onPress={onFollowingPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${followingCount} following`}
        >
          <Text style={styles.profileStatValue}>{followingCount}</Text>
          <Text style={styles.profileStatLabel}>Following</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
