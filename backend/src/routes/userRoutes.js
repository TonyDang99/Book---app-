import express from "express";
import mongoose from "mongoose";

import Book from "../models/Book.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Public profile data is deliberately limited to information needed by the app.
router.get("/:id", protectRoute, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select("username profileImage createdAt");
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
      },
      books,
    });
  } catch (error) {
    console.error("Error fetching user profile", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
