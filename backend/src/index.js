import express from "express";  
import cor from "cors";
import "dotenv/config";
 
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import {connectDB} from "./lib/db.js";

const app = express();
// nếu có PORT trong env thì dùng, ko thì dùng 3000 //
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cor()); 
 
app.use("/api/auth",authRoutes);
app.use("/api/books",bookRoutes);

app.listen(PORT,  () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
}); 