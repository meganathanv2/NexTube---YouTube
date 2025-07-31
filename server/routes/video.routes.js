import express from "express";
import { 
  uploadVideo, 
  getVideos, 
  getSingleVideo, 
  likeVideo, 
  dislikeVideo, 
  getRecommendedVideos,
  getUserVideos,
  deleteVideo,
  upload 
} from "../controllers/video.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optional-auth.middleware.js";

const router = express.Router();

router.post("/upload", verifyToken, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), uploadVideo);
router.get("/", getVideos);
router.get("/user/videos", verifyToken, getUserVideos);
router.get("/:id", optionalAuth, getSingleVideo); // Use optionalAuth to handle both logged-in and anonymous users
router.put("/:id/like", verifyToken, likeVideo);
router.put("/:id/dislike", verifyToken, dislikeVideo);
router.get("/:id/recommended", getRecommendedVideos);
router.delete("/:id", verifyToken, deleteVideo);


export default router;
