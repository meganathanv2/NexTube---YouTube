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

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error("Error loading .env file:", result.error);
}

// Check if dotenv loaded successfully
console.log(".env file loaded:", !result.error);

// Validate environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://nextube-nine.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.get('/', (req, res) => {
  res.send("Welcome to NexTube API");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/playlists", playlistRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({ message: "Internal server error" });
});

// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
console.log("MongoDB URI defined:", !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(`Error name: ${err.name}`);
    console.error(`Error message: ${err.message}`);
    
    // Check for common connection issues
    if (err.name === 'MongoNetworkError') {
      console.error("Network connectivity issue - check your internet connection or Atlas status");
    } else if (err.message.includes('Authentication failed')) {
      console.error("Authentication failed - check your username and password");
    } else if (err.message.includes('connect ECONNREFUSED')) {
      console.error("Connection refused - check if IP is whitelisted on Atlas");
    }
    
    // Don't exit in development to allow fixing the issue
    if (isProduction) {
      process.exit(1);
    }
  });