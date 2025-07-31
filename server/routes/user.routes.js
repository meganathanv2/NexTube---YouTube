import express from "express";
import { 
  getUserHistory,
  getUserLikedVideos, 
  getUserWatchLater,
  addToWatchLater,
  removeFromWatchLater
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Watch history endpoints
router.get("/history", verifyToken, getUserHistory);

// Liked videos endpoints
router.get("/liked-videos", verifyToken, getUserLikedVideos);

// Watch later endpoints
router.get("/watch-later", verifyToken, getUserWatchLater);
router.post("/watch-later/:videoId", verifyToken, addToWatchLater);
router.delete("/watch-later/:videoId", verifyToken, removeFromWatchLater);

export default router;
