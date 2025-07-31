import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

// Add video to user's watch history
export const addToHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update user's history
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          history: { video: videoId, watchedAt: Date.now() }
        }
      },
      { new: true }
    );

    // Update video's views and viewedBy (if user hasn't viewed it before)
    if (!video.viewedBy.includes(userId)) {
      await Video.findByIdAndUpdate(
        videoId,
        {
          $inc: { views: 1 },
          $addToSet: { viewedBy: userId }
        },
        { new: true }
      );
    }

    return res.status(200).json({ message: "Added to watch history" });
  } catch (err) {
    console.error(`Error adding to history for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's watch history with pagination
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "history.video",
        populate: {
          path: "createdBy",
          select: "username profilePic"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.history || !Array.isArray(user.history)) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { history: [] } },
        { new: true }
      );
      return res.status(200).json({
        history: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      });
    }

    // Filter valid history entries
    const validHistory = user.history.filter(
      entry => entry && entry.video && mongoose.Types.ObjectId.isValid(entry.video)
    );

    // Clean up invalid entries
    if (validHistory.length < user.history.length) {
      await User.findByIdAndUpdate(
        userId,
        { $set: { history: validHistory } },
        { new: true }
      );
    }

    // Transform and sort history data
    const historyVideos = validHistory
      .map(item => ({
        ...item.video.toObject(),
        viewedAt: item.watchedAt
      }))
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    // Paginate results
    const paginatedVideos = historyVideos.slice(skip, skip + limit);

    return res.status(200).json({
      history: paginatedVideos,
      totalItems: historyVideos.length,
      totalPages: Math.ceil(historyVideos.length / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(`Error getting watch history for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's liked videos
export const getUserLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const videos = await Video.find({ likes: userId })
      .sort({ updatedAt: -1 })
      .populate("createdBy", "username profilePic");

    return res.status(200).json(videos);
  } catch (err) {
    console.error(`Error getting liked videos for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's watch later list
export const getUserWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

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

    return res.status(200).json(user.watchLater || []);
  } catch (err) {
    console.error(`Error getting watch later for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add a video to watch later
export const addToWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchLater: videoId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Added to Watch Later" });
  } catch (err) {
    console.error(`Error adding video to watch later for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a video from watch later
export const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { watchLater: videoId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Removed from Watch Later" });
  } catch (err) {
    console.error(`Error removing video from watch later for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Clear user's watch history
export const clearWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { history: [] } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Watch history cleared" });
  } catch (err) {
    console.error(`Error clearing watch history for user ${userId}:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};