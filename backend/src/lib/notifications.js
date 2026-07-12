import Notification from "../models/Notification.js";
import User from "../models/User.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const isExpoPushToken = (token) => /^(Expo|Exponent)PushToken\[[^\]]+\]$/.test(token);

export const formatNotificationPreview = (text, maxLength = 180) => {
  const normalizedText = text?.trim().replace(/\s+/g, " ") || "";
  if (normalizedText.length <= maxLength) return normalizedText;
  return `${normalizedText.slice(0, maxLength - 1).trimEnd()}…`;
};

const sendPushNotifications = async (recipient, notification, unreadCount) => {
  const tokens = (recipient.pushTokens || []).filter(isExpoPushToken);
  if (tokens.length === 0) return;

  let targetRoute = notification.actor ? `/user/${notification.actor}` : "/(tabs)/notifications";
  if (notification.conversation) {
    targetRoute = `/chat/${notification.conversation}`;
  } else if (notification.book) {
    const commentQuery = notification.comment
      ? `?commentId=${encodeURIComponent(notification.comment.toString())}`
      : "";
    targetRoute = `/book/${notification.book}${commentQuery}`;
  }
  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    channelId: "activity",
    title: "BookWorm",
    body: notification.message,
    badge: unreadCount,
    data: {
      notificationId: notification._id.toString(),
      type: notification.type,
      route: targetRoute,
    },
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      console.error("Expo push service error", response.status, await response.text());
      return;
    }

    const result = await response.json();
    const tickets = Array.isArray(result.data) ? result.data : [result.data];
    const invalidTokens = tickets
      .map((ticket, index) =>
        ticket?.status === "error" && ticket?.details?.error === "DeviceNotRegistered"
          ? tokens[index]
          : null
      )
      .filter(Boolean);

    if (invalidTokens.length > 0) {
      await User.findByIdAndUpdate(recipient._id, {
        $pull: { pushTokens: { $in: invalidTokens } },
      });
    }
  } catch (error) {
    console.error("Error sending push notification", error.message);
  }
};

export const createNotification = async ({
  recipientId,
  actorId,
  type,
  message,
  bookId = null,
  commentId = null,
  reactionType = null,
  conversationId = null,
}) => {
  if (!recipientId || recipientId.toString() === actorId.toString()) return null;

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    message,
    book: bookId,
    comment: commentId,
    reactionType,
    conversation: conversationId,
  });

  const [recipient, unreadCount] = await Promise.all([
    User.findById(recipientId).select("+pushTokens"),
    Notification.countDocuments({ recipient: recipientId, isRead: false }),
  ]);

  if (recipient) {
    void sendPushNotifications(recipient, notification, unreadCount);
  }

  return notification;
};
