import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

// Get user's watch history
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find videos that have this user in their viewedBy array
    const videos = await Video.find({ viewedBy: userId })
      .sort({ updatedAt: -1 }) // Sort by most recently viewed
      .populate("createdBy", "username profilePic");

    res.status(200).json(videos);
  } catch (err) {
    console.error("Error getting user watch history:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's liked videos
export const getUserLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find videos that have this user in their likes array
    const videos = await Video.find({ likes: userId })
      .sort({ updatedAt: -1 }) // Sort by most recently liked
      .populate("createdBy", "username profilePic");

    res.status(200).json(videos);
  } catch (err) {
    console.error("Error getting user liked videos:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's watch later list
export const getUserWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the user document and their watchLater array
    const user = await User.findById(userId).populate({
      path: "watchLater",
      populate: {
        path: "createdBy",
        select: "username profilePic"
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the populated watchLater array
    res.status(200).json(user.watchLater || []);
  } catch (err) {
    console.error("Error getting watch later videos:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add a video to watch later
export const addToWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Add video to user's watchLater array if not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchLater: videoId } }, // Use addToSet to avoid duplicates
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Added to Watch Later" });
  } catch (err) {
    console.error("Error adding to watch later:", err);
    res.status(500).json({ message: err.message });
  }
};

// Remove a video from watch later
export const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    // Remove video from user's watchLater array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { watchLater: videoId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Removed from Watch Later" });
  } catch (err) {
    console.error("Error removing from watch later:", err);
    res.status(500).json({ message: err.message });
  }
};
