import express from "express";
import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();
const isExpoPushToken = (token) => /^(Expo|Exponent)PushToken\[[^\]]+\]$/.test(token);

router.get("/", protectRoute, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actor", "username profileImage");
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/unread-count", protectRoute, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/read-all", protectRoute, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ unreadCount: 0 });
  } catch (error) {
    console.error("Error marking notifications as read", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/read", protectRoute, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ notification, unreadCount });
  } catch (error) {
    console.error("Error marking notification as read", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/push-token", protectRoute, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!isExpoPushToken(pushToken)) {
      return res.status(400).json({ message: "Invalid Expo push token" });
    }

    // A device token belongs to only the account currently signed in on that device.
    await User.updateMany({ pushTokens: pushToken }, { $pull: { pushTokens: pushToken } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { pushTokens: pushToken } });
    res.json({ message: "Push token registered" });
  } catch (error) {
    console.error("Error registering push token", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/push-token", protectRoute, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (pushToken) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { pushTokens: pushToken } });
    }
    res.json({ message: "Push token removed" });
  } catch (error) {
    console.error("Error removing push token", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
