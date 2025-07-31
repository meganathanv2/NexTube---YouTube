import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import userRoutes from "./routes/user.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

dotenv.config();

// Set a consistent JWT secret
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'fallback_secret_for_development';
  console.log('⚠️ Using fallback JWT_SECRET. Set JWT_SECRET in .env for production.');
}

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // ✅ Allows large JSON body
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // ✅ Allows form submissions with large data
app.use(cookieParser());

// Session middleware for tracking views
app.use(session({
  secret: process.env.JWT_SECRET, // Reuse JWT secret for simplicity
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/playlists", playlistRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));
