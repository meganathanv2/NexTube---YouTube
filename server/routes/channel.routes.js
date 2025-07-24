import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { 
  createChannel, 
  getChannelByUserId, 
  updateChannel,
  checkUserChannel
} from "../controllers/channel.controller.js";

const router = express.Router();

// Create a new channel (requires authentication)
router.post("/", verifyToken, createChannel);

// Get current user's channel
router.get("/me", verifyToken, getChannelByUserId);

// Get channel by user ID
router.get("/:userId", getChannelByUserId);

// Update channel (requires authentication)
router.put("/", verifyToken, updateChannel);

// Check if user has a channel
router.get("/check/status", verifyToken, checkUserChannel);

export default router;