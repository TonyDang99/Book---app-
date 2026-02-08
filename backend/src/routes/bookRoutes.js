import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload image to Cloudinary //
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        //save to the database //
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        await newBook.save();
        res.status(201).json(newBook);

    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: error.message });
    }
});


//pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;


        const books = await Book.find().sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username email");

            const totalBook = await Book.countDocuments();
        res.send({
            books,
            curentPage: page,
            totalBook,
            totalPage: Math.ceil(totalBook / limit), 
        });
    } catch (error) {
        console.error("Error in get all book:", error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        //check if the user is the owner of the book //
        if (book.user.toString() !== req.user._id.toString()) 
            return res.status(401).json({ message: "Unauthorized"});

        //delete image 
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId); 
                
            } catch (deleteError) {
                console.log("Error deleting image from Cloudinary:", deleteError);
            }
            }

        await book.deleteOne(); 

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting book:", error);
        res.status(500).json({ message: "Internal server error"});
    }
});

export default router;  
