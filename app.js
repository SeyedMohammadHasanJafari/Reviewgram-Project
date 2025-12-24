import express, { json } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import reviewRoutes from "./routes/review.route.js";
import pagesRoutes from "./routes/pages.route.js";
import adminRoutes from "./routes/admin.route.js";
import friendshipRoutes from "./routes/friendship.route.js";

const app = express();

const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/movie_review";
const PORT = 5000;
const JWT_SECRET =
  "6ae9271457780916410ef74855f7e2299364ef006eb8e6bc2cf6bc821483ed1d";

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(json());

// View Engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Routes
app.use("/auth", authRoutes);
app.use("/movie", movieRoutes);
app.use("/review", reviewRoutes);
app.use("/pages", pagesRoutes);
app.use("/public", express.static("public"));
app.use("/admin", adminRoutes);
app.use("/friendship", friendshipRoutes);

if (process.env.NODE_ENV !== "test") {
  mongoose.set("strictQuery", true);

  console.log("---------------------------------------------------");
  console.log("🚀 Attempting to connect to MongoDB at:", DATABASE_URL);
  console.log("---------------------------------------------------");

  mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("✅ Connected to Database Successfully");
      app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("❌ FAILED to connect to Database:", error.message);
      console.error("Full Error:", error);
    });
}

export { app };
export default JWT_SECRET;
