import express from "express";
import { 
  addToHistory,
  getUserHistory,
  getUserLikedVideos, 
  getUserWatchLater,
  addToWatchLater,
  removeFromWatchLater,
  clearWatchHistory
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Watch history endpoints
router.post("/history/:videoId", verifyToken, addToHistory);
router.get("/history", verifyToken, getUserHistory);
router.delete("/history", verifyToken, clearWatchHistory);

// Liked videos endpoints
router.get("/liked-videos", verifyToken, getUserLikedVideos);

// Watch later endpoints
router.get("/watch-later", verifyToken, getUserWatchLater);
router.post("/watch-later/:videoId", verifyToken, addToWatchLater);
router.delete("/watch-later/:videoId", verifyToken, removeFromWatchLater);

export default router;