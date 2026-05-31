import express from "express";  
import cor from "cors";
import "dotenv/config";
import job from "./lib/cron.js";
 
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import {connectDB} from "./lib/db.js";

const app = express();
// nếu có PORT trong env thì dùng, ko thì dùng 3000 //
const PORT = process.env.PORT || 3000;


job.start(); // khởi động cron job  

app.use(express.json({ limit: "10mb" }));
app.use(cor()); 

app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Image is too large. Please choose a smaller image." });
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON request body" });
    }

    next(err);
});
 
app.use("/api/auth",authRoutes);
app.use("/api/books",bookRoutes);

app.listen(PORT,  () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
}); 
