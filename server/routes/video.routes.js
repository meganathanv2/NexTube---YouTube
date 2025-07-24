import express from "express";
import { 
  uploadVideo, 
  getVideos, 
  getSingleVideo, 
  likeVideo, 
  dislikeVideo, 
  getRecommendedVideos,
  upload 
} from "../controllers/video.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/upload", verifyToken, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), uploadVideo);
router.get("/", getVideos);
router.get("/:id", getSingleVideo);
router.put("/:id/like", verifyToken, likeVideo);
router.put("/:id/dislike", verifyToken, dislikeVideo);
router.get("/:id/recommended", getRecommendedVideos);


export default router;
