import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import createStyles from "../../assets/styles/messages.styles";
import Loader from "../../components/Loader";
import useTheme from "../../hooks/useTheme";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { useMessageStore } from "../../store/messageStore";

const formatMessageTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const hasPhotoAccess = (permission) =>
  permission?.granted || permission?.accessPrivileges === "limited";

const showSettingsAlert = (title, message) => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: () => Linking.openSettings() },
  ]);
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuthStore();
  const setUnreadCount = useMessageStore((state) => state.setUnreadCount);
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [pendingImageUri, setPendingImageUri] = useState(null);
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const listRef = useRef(null);

  const conversationId = Array.isArray(id) ? id[0] : id;
  const currentUserId = user?.id || user?._id;
  const canSend = Boolean(messageText.trim() || pendingImageDataUrl);

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!conversationId) return;
      try {
        if (!silent) setLoading(true);
        const data = await fetchApi(`/messages/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversation(data.conversation);
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        if (!silent) Alert.alert("Error", error.message || "Failed to load messages");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [conversationId, setUnreadCount, token]
  );

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      const interval = setInterval(() => fetchMessages(true), 3500);
      return () => clearInterval(interval);
    }, [fetchMessages])
  );

  useEffect(() => {
    if (Platform.OS !== "ios") return undefined;

    const moveComposerAboveKeyboard = (event) => {
      Keyboard.scheduleLayoutAnimation?.(event);
      setKeyboardInset(Math.max(0, event.endCoordinates?.height || 0));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
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
  }, []);

  const clearPendingImage = () => {
    setPendingImageUri(null);
    setPendingImageDataUrl(null);
  };

  const processPickedAsset = async (asset) => {
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

    setPendingImageUri(asset.uri);
    setPendingImageDataUrl(imageDataUrl);
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        let permission = await ImagePicker.getCameraPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestCameraPermissionsAsync();
        }
        if (!permission.granted) {
          if (!permission.canAskAgain) {
            showSettingsAlert(
              "Camera Permission Required",
              "Camera access is turned off. Open Settings and allow camera access to take photos for messages."
            );
          } else {
            Alert.alert(
              "Camera Permission Required",
              "Allow camera access so you can take photos to send in messages."
            );
          }
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.5,
        base64: true,
      });

      if (result.canceled) return;
      await processPickedAsset(result.assets[0]);
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "There was a problem taking your photo");
    }
  };

  const pickFromLibrary = async () => {
    try {
      if (Platform.OS !== "web") {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!hasPhotoAccess(permission) && permission.canAskAgain) {
          permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        if (!hasPhotoAccess(permission)) {
          if (!permission.canAskAgain) {
            showSettingsAlert(
              "Photo Permission Required",
              "Photo access is turned off. Open Settings and allow photo access to send photos in messages."
            );
          } else {
            Alert.alert(
              "Photo Permission Required",
              "Allow photo access so you can send photos in messages."
            );
          }
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.5,
        base64: true,
      });

      if (result.canceled) return;
      await processPickedAsset(result.assets[0]);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const handleAttachPress = () => {
    if (sending) return;

    Alert.alert("Add photo", "Choose how you want to add a photo to your message.", [
      { text: "Take photo", onPress: takePhoto },
      { text: "Choose from library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSend = async () => {
    const text = messageText.trim();
    if ((!text && !pendingImageDataUrl) || sending) return;

    try {
      setSending(true);
      const body = { text };
      if (pendingImageDataUrl) body.image = pendingImageDataUrl;

      const message = await fetchApi(`/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      setMessages((current) =>
        current.some((item) => item._id === message._id) ? current : [...current, message]
      );
      setMessageText("");
      clearPendingImage();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender?._id?.toString() === currentUserId?.toString();
    const hasText = Boolean(item.text?.trim());

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              contentFit="cover"
            />
          ) : null}
          {hasText ? (
            <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
              {item.text}
            </Text>
          ) : null}
          <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) return <Loader />;

  const otherUser = conversation?.otherUser;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : undefined}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.chatBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Pressable
          style={styles.chatProfileButton}
          onPress={() => otherUser?._id && router.push(`/user/${otherUser._id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${otherUser?.username || "user"}'s profile`}
        >
          <Image source={{ uri: otherUser?.profileImage }} style={styles.chatAvatar} />
          <View>
            <Text style={styles.chatUsername}>{otherUser?.username || "Conversation"}</Text>
            <Text style={styles.chatStatus}>Direct message</Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.chatEmpty}>
            <Ionicons name="paper-plane-outline" size={38} color={colors.textSecondary} />
            <Text style={styles.chatEmptyText}>Send a message to start the conversation.</Text>
          </View>
        }
      />

      <View
        style={[
          styles.composerWrap,
          {
            marginBottom: Platform.OS === "ios" ? keyboardInset : 0,
            paddingBottom:
              Platform.OS === "ios" && keyboardInset === 0 ? Math.max(insets.bottom, 10) : 10,
          },
        ]}
      >
        {pendingImageUri ? (
          <View style={styles.imagePreviewRow}>
            <Image
              source={{ uri: pendingImageUri }}
              style={styles.imagePreviewThumb}
              contentFit="cover"
            />
            <Pressable
              style={styles.imagePreviewClear}
              onPress={clearPendingImage}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="close" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable
            style={styles.attachButton}
            onPress={handleAttachPress}
            disabled={sending}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </Pressable>
          <TextInput
            style={styles.messageInput}
            placeholder={pendingImageUri ? "Add a caption..." : "Message..."}
            placeholderTextColor={colors.placeholderText}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={2000}
            onFocus={() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120)}
          />
          <Pressable
            style={[styles.sendButton, (!canSend || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
