import express from "express";
import mongoose from "mongoose";

import cloudinary from "../lib/cloudinary.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";
import { createNotification } from "../lib/notifications.js";

const router = express.Router();
const isValidId = (id) => mongoose.isValidObjectId(id);
const makeParticipantsKey = (firstId, secondId) =>
  [firstId.toString(), secondId.toString()].sort().join(":");

const getUnreadCount = async (userId) => {
  const conversationIds = await Conversation.find({ participants: userId }).distinct("_id");
  return Message.countDocuments({
    sender: { $ne: userId },
    readAt: null,
    conversation: { $in: conversationIds },
  });
};

const findConversationForUser = (conversationId, userId) =>
  Conversation.findOne({ _id: conversationId, participants: userId });

router.get("/unread-count", protectRoute, async (req, res) => {
  try {
    const unreadCount = await getUnreadCount(req.user._id);
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread message count", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/conversations", protectRoute, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "username profileImage");
    const conversationIds = conversations.map((conversation) => conversation._id);
    const unreadByConversation = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: req.user._id },
          readAt: null,
        },
      },
      { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]);
    const unreadMap = new Map(
      unreadByConversation.map((item) => [item._id.toString(), item.count])
    );

    const result = conversations.map((conversation) => {
      const otherUser = conversation.participants.find(
        (participant) => participant._id.toString() !== req.user._id.toString()
      );
      return {
        id: conversation._id,
        otherUser,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        lastSender: conversation.lastSender,
        unreadCount: unreadMap.get(conversation._id.toString()) || 0,
      };
    });

    res.json({
      conversations: result,
      unreadCount: result.reduce((total, conversation) => total + conversation.unreadCount, 0),
    });
  } catch (error) {
    console.error("Error fetching conversations", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/conversations/:userId", protectRoute, async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const otherUser = await User.findById(req.params.userId).select("username profileImage");
    if (!otherUser) return res.status(404).json({ message: "User not found" });

    const participantsKey = makeParticipantsKey(req.user._id, otherUser._id);
    const conversation = await Conversation.findOneAndUpdate(
      { participantsKey },
      {
        $setOnInsert: {
          participants: [req.user._id, otherUser._id],
          participantsKey,
          lastMessageAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ conversation: { id: conversation._id, otherUser } });
  } catch (error) {
    console.error("Error creating conversation", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", protectRoute, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conversation = await findConversationForUser(req.params.id, req.user._id).populate(
      "participants",
      "username profileImage"
    );
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "username profileImage");
    const otherUser = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user._id.toString()
    );
    const unreadCount = await getUnreadCount(req.user._id);

    res.json({
      conversation: { id: conversation._id, otherUser },
      messages: messages.reverse(),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching messages", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", protectRoute, async (req, res) => {
  try {
    const text = req.body.text?.trim() || "";
    const image = req.body.image;

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: "Message must be 2000 characters or less" });
    }
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conversation = await findConversationForUser(req.params.id, req.user._id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      imageUrl,
    });

    const lastMessage = text || "Photo";
    await Conversation.findByIdAndUpdate(conversation._id, {
      $set: {
        lastMessage,
        lastSender: req.user._id,
        lastMessageAt: message.createdAt,
      },
    });
    await message.populate("sender", "username profileImage");

    const recipientId = conversation.participants.find(
      (participantId) => participantId.toString() !== req.user._id.toString()
    );
    const notificationMessage = imageUrl
      ? text
        ? `${req.user.username} sent you a photo: ${text.slice(0, 100)}`
        : `${req.user.username} sent you a photo`
      : `${req.user.username} sent you a message: ${text.slice(0, 100)}`;

    await createNotification({
      recipientId,
      actorId: req.user._id,
      type: "message",
      message: notificationMessage,
      conversationId: conversation._id,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
