import express from "express";
import mongoose from "mongoose";

import Book from "../models/Book.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const isValidUserId = (id) => mongoose.isValidObjectId(id);

const getFollowState = async (userId, currentUserId) => {
  const user = await User.findById(userId).select("followers following");
  if (!user) return null;

  return {
    followersCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: user.followers.some(
      (followerId) => followerId.toString() === currentUserId.toString()
    ),
  };
};

router.post("/:id/follow", protectRoute, async (req, res) => {
  try {
    if (!isValidUserId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.exists({ _id: req.params.id });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.params.id },
          update: { $addToSet: { followers: req.user._id } },
        },
      },
      {
        updateOne: {
          filter: { _id: req.user._id },
          update: { $addToSet: { following: req.params.id } },
        },
      },
    ]);

    const followState = await getFollowState(req.params.id, req.user._id);
    res.json(followState);
  } catch (error) {
    console.error("Error following user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id/follow", protectRoute, async (req, res) => {
  try {
    if (!isValidUserId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const targetUser = await User.exists({ _id: req.params.id });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: req.params.id },
          update: { $pull: { followers: req.user._id } },
        },
      },
      {
        updateOne: {
          filter: { _id: req.user._id },
          update: { $pull: { following: req.params.id } },
        },
      },
    ]);

    const followState = await getFollowState(req.params.id, req.user._id);
    res.json(followState);
  } catch (error) {
    console.error("Error unfollowing user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Public profile data is deliberately limited to information needed by the app.
router.get("/:id", protectRoute, async (req, res) => {
  try {
    if (!isValidUserId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select(
      "username profileImage createdAt followers following"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const books = await Book.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select("title author caption rating image createdAt");

    res.json({
      user: {
        id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: user.followers.some(
          (followerId) => followerId.toString() === req.user._id.toString()
        ),
      },
      books,
    });
  } catch (error) {
    console.error("Error fetching user profile", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
