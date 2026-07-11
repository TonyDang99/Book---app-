import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import Comment from "../models/Comment.js";
import protectRoute from "../middleware/auth.middleware.js";
import { buildCommentThreads, formatCommentResponse, REACTION_TYPES } from "../lib/commentUtils.js";
import { createNotification } from "../lib/notifications.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database
    const newBook = new Book({
      title,
      author: req.user.username,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
  // example call from react native - frontend
  // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 2;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) // desc
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/comments", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const comments = await Comment.find({ book: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "username profileImage");

    res.json(buildCommentThreads(comments, req.user._id));
  } catch (error) {
    console.log("Error fetching comments", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/comments", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const comment = new Comment({
      book: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    await comment.save();
    await comment.populate("user", "username profileImage");

    await createNotification({
      recipientId: book.user,
      actorId: req.user._id,
      type: "comment",
      message: `${req.user.username} commented on your recommendation “${book.title}”.`,
      bookId: book._id,
      commentId: comment._id,
    });

    res.status(201).json(formatCommentResponse(comment, req.user._id));
  } catch (error) {
    console.log("Error creating comment", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/comments/:commentId/replies", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const [parentComment, book] = await Promise.all([
      Comment.findOne({
        _id: req.params.commentId,
        book: req.params.id,
      }),
      Book.findById(req.params.id).select("title"),
    ]);
    if (!parentComment) return res.status(404).json({ message: "Comment not found" });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const reply = new Comment({
      book: req.params.id,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment._id,
    });

    await reply.save();
    await reply.populate("user", "username profileImage");

    await createNotification({
      recipientId: parentComment.user,
      actorId: req.user._id,
      type: "reply",
      message: `${req.user.username} replied to your comment on “${book.title}”.`,
      bookId: book._id,
      commentId: reply._id,
    });

    res.status(201).json(formatCommentResponse(reply, req.user._id));
  } catch (error) {
    console.log("Error creating reply", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/comments/:commentId/reactions", protectRoute, async (req, res) => {
  try {
    const { type } = req.body;

    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const comment = await Comment.findOne({
      _id: req.params.commentId,
      book: req.params.id,
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id.toString();
    const existingIndex = comment.reactions.findIndex(
      (reaction) => reaction.user.toString() === userId
    );
    let shouldNotify = true;

    if (existingIndex >= 0) {
      if (comment.reactions[existingIndex].type === type) {
        comment.reactions.splice(existingIndex, 1);
        shouldNotify = false;
      } else {
        comment.reactions[existingIndex].type = type;
      }
    } else {
      comment.reactions.push({ user: req.user._id, type });
    }

    await comment.save();
    await comment.populate("user", "username profileImage");

    if (shouldNotify) {
      await createNotification({
        recipientId: comment.user._id,
        actorId: req.user._id,
        type: "reaction",
        message: `${req.user.username} reacted ${type} to your comment on “${book.title}”.`,
        bookId: book._id,
        commentId: comment._id,
        reactionType: type,
      });
    }

    res.json(formatCommentResponse(comment, req.user._id));
  } catch (error) {
    console.log("Error reacting to comment", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("user", "username profileImage");

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (error) {
    console.log("Error fetching book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png
    // delete image from cloduinary as well
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();
    await Comment.deleteMany({ book: req.params.id });
    await Notification.deleteMany({ book: req.params.id });

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
