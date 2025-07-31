import cloudinary from "../utils/cloudinary.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create upload middleware
export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Not a video file!'));
      }
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image file!'));
      }
    } else {
      cb(null, true);
    }
  }
});

export const uploadVideo = async (req, res) => {
  try {
    // Check if user has a channel
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.hasChannel) {
      return res.status(403).json({ 
        message: "You need to create a channel before uploading videos",
        needsChannel: true
      });
    }
    
    const { title, description } = req.body;
    const videoFile = req.files['video'][0];
    const thumbnailFile = req.files['thumbnail'][0];

    // Upload video to Cloudinary
    const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: "video",
      folder: "youtube-clone/videos",
    });

    // Upload thumbnail to Cloudinary
    const thumbUpload = await cloudinary.uploader.upload(thumbnailFile.path, {
      resource_type: "image",
      folder: "youtube-clone/thumbnails",
    });
    
    // Clean up temporary files
    await fs.unlink(videoFile.path);
    await fs.unlink(thumbnailFile.path);

    const newVideo = new Video({
      title,
      description,
      videoUrl: videoUpload.secure_url,
      thumbnailUrl: thumbUpload.secure_url,
      createdBy: req.user.id,
    });

    await newVideo.save();

    res.status(201).json({ message: "Video uploaded successfully", newVideo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find().populate("createdBy", "username profilePic").sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });

    }
};

export const getSingleVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user ? req.user.id : null;
    
    // First, retrieve the video to check if it exists and get current state
    const video = await Video.findById(videoId).populate("createdBy", "username profilePic");
    
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    let viewCountUpdated = false;
    
    // Handle view counting differently based on whether user is logged in
    if (userId) {
      // For logged-in users: check if user ID exists in viewedBy array
      const viewedByArray = video.viewedBy || [];
      const alreadyViewed = viewedByArray.some(id => id.toString() === userId.toString());
      
      // Only update if user hasn't viewed this video before
      if (!alreadyViewed) {
        console.log(`User ${userId} viewing video ${videoId} for the first time`);
        
        // Use findOneAndUpdate with atomic operators to prevent race conditions
        const updatedVideo = await Video.findOneAndUpdate(
          { 
            _id: videoId, 
            viewedBy: { $ne: userId } // Ensure the user isn't already in the array (double-check)
          },
          { 
            $inc: { views: 1 },
            $addToSet: { viewedBy: userId } // $addToSet ensures no duplicates
          },
          { new: true }
        );
        
        // Only consider view updated if the document was actually modified
        viewCountUpdated = !!updatedVideo;
      } else {
        console.log(`User ${userId} has already viewed video ${videoId}`);
      }
      
      // Add to user's history regardless of whether this counts as a new view
      // Find the user and update their history
      await User.findByIdAndUpdate(
        userId,
        {
          // Add to the beginning of the history array
          $push: {
            history: {
              $each: [{ video: videoId, watchedAt: new Date() }],
              $position: 0
            }
          }
        }
      );
    } else {
      // For non-logged-in users, use IP-based tracking
      const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      // Create a unique key for the IP + video combination
      // In a real implementation, you might want to store this in Redis or a dedicated session store
      const ipKey = `video:${videoId}:ip:${clientIP}`;
      
      // We'll implement a simplified version here - checking if there's a session
      if (!req.session) {
        req.session = {};
      }
      
      if (!req.session.viewedVideos) {
        req.session.viewedVideos = {};
      }
      
      // Check if this IP has already viewed this video in this session
      if (!req.session.viewedVideos[ipKey]) {
        console.log(`Anonymous user (IP: ${clientIP.substring(0, 10)}...) viewing video ${videoId} for the first time`);
        
        // Mark as viewed for this session
        req.session.viewedVideos[ipKey] = true;
        
        // Increment view count
        await Video.updateOne({ _id: videoId }, { $inc: { views: 1 } });
        viewCountUpdated = true;
      } else {
        console.log(`Anonymous user (IP: ${clientIP.substring(0, 10)}...) has already viewed video ${videoId}`);
      }
    }
    
    // Update the response object's view count if we incremented it
    if (viewCountUpdated) {
      video.views += 1;
    }

    res.status(200).json(video);
  } catch (err) {
    console.error("Error getting single video:", err);
    res.status(500).json({ message: err.message });
  }
};

export const likeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    console.log("Like request - Video ID:", videoId, "User ID:", userId);

    // Validate the video ID format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    console.log("Current video likes:", video.likes);
    console.log("Current video dislikes:", video.dislikes);
    
    // Check if user already liked the video (convert ObjectIds to strings for comparison)
    const alreadyLiked = video.likes.some(id => id.toString() === userId.toString());
    
    // Check if user already disliked the video (convert ObjectIds to strings for comparison)
    const alreadyDisliked = video.dislikes.some(id => id.toString() === userId.toString());
    
    console.log("Already liked:", alreadyLiked);
    console.log("Already disliked:", alreadyDisliked);
    
    let updatedVideo;
    
    // If already liked, remove the like (toggle)
    if (alreadyLiked) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { likes: userId }
        },
        { new: true }
      );
      return res.status(200).json({ 
        message: "Like removed",
        likes: updatedVideo.likes,
        dislikes: updatedVideo.dislikes
      });
    }
    
    // If already disliked, remove dislike and add like
    if (alreadyDisliked) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { dislikes: userId },
          $push: { likes: userId }
        },
        { new: true }
      );
      return res.status(200).json({ 
        message: "Dislike removed and like added",
        likes: updatedVideo.likes,
        dislikes: updatedVideo.dislikes
      });
    }
    
    // Otherwise, just add like
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $push: { likes: userId }
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Video liked",
      likes: updatedVideo.likes,
      dislikes: updatedVideo.dislikes
    });
  } catch (err) {
    console.error("Error in likeVideo:", err);
    res.status(500).json({ message: err.message });
  }
};

export const dislikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    console.log("Dislike request - Video ID:", videoId, "User ID:", userId);
    
    // Validate the video ID format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }
    
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    console.log("Current video likes:", video.likes);
    console.log("Current video dislikes:", video.dislikes);
    
    // Check if user already disliked the video (convert ObjectIds to strings for comparison)
    const alreadyDisliked = video.dislikes.some(id => id.toString() === userId.toString());
    
    // Check if user already liked the video (convert ObjectIds to strings for comparison)
    const alreadyLiked = video.likes.some(id => id.toString() === userId.toString());
    
    console.log("Already liked:", alreadyLiked);
    console.log("Already disliked:", alreadyDisliked);
    
    let updatedVideo;
    
    // If already disliked, remove the dislike (toggle)
    if (alreadyDisliked) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { dislikes: userId }
        },
        { new: true }
      );
      return res.status(200).json({ 
        message: "Dislike removed",
        likes: updatedVideo.likes,
        dislikes: updatedVideo.dislikes
      });
    }
    
    // If already liked, remove like and add dislike
    if (alreadyLiked) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { likes: userId },
          $push: { dislikes: userId }
        },
        { new: true }
      );
      return res.status(200).json({ 
        message: "Like removed and dislike added",
        likes: updatedVideo.likes,
        dislikes: updatedVideo.dislikes
      });
    }
    
    // Otherwise, just add dislike
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $push: { dislikes: userId }
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Video disliked",
      likes: updatedVideo.likes,
      dislikes: updatedVideo.dislikes
    });
  } catch (err) {
    console.error("Error in dislikeVideo:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get videos uploaded by the current user
export const getUserVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log("Getting videos for user ID:", userId);
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user has a channel
    if (!user.hasChannel) {
      return res.status(403).json({ 
        message: "You need to create a channel first", 
        hasChannel: false 
      });
    }
    
    // Get videos created by this user
    const videos = await Video.find({ createdBy: userId })
      .sort({ createdAt: -1 }) // newest first
      .populate("createdBy", "username profilePic");
    
    console.log(`Found ${videos.length} videos for user ${userId}`);
    
    res.status(200).json({ 
      videos,
      hasChannel: true
    });
  } catch (err) {
    console.error("Error in getUserVideos:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getRecommendedVideos = async (req, res) => {
  try {
    const videoId = req.params.id;
    
    // Validate MongoDB ID format to avoid casting errors
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }
    
    // Get current video to find recommendations based on the same creator or tags
    const currentVideo = await Video.findById(videoId);
    if (!currentVideo) return res.status(404).json({ message: "Video not found" });
    
    // Find videos from same creator or with similar properties, excluding the current video
    const recommendedVideos = await Video.find({
      _id: { $ne: videoId }, // exclude current video
      $or: [
        { createdBy: currentVideo.createdBy }, // same creator
        // Could add more complex recommendation logic here
      ]
    })
    .populate("createdBy", "username profilePic")
    .limit(8)
    .sort({ views: -1 }); // sort by popularity
    
    // If not enough videos from same creator, add more recommendations
    if (recommendedVideos.length < 8) {
      const additionalVideos = await Video.find({
        _id: { $ne: videoId },
        createdBy: { $ne: currentVideo.createdBy }
      })
      .populate("createdBy", "username profilePic")
      .limit(8 - recommendedVideos.length)
      .sort({ views: -1 });
      
      recommendedVideos.push(...additionalVideos);
    }
    
    res.status(200).json(recommendedVideos);
  } catch (err) {
    console.error("Error getting recommended videos:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID format" });
    }
    
    // Find the video
    const video = await Video.findById(videoId);
    
    // Check if video exists
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if user owns the video
    if (video.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own videos" });
    }
    
    // Delete video from cloudinary (extract public_id from URL)
    try {
      const videoPublicId = video.videoUrl.split('/').slice(-2).join('/').split('.')[0];
      const thumbnailPublicId = video.thumbnailUrl.split('/').slice(-2).join('/').split('.')[0];
      
      // Delete files from Cloudinary (won't fail if deletion fails)
      await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" })
        .catch(err => console.warn("Warning: Couldn't delete video from Cloudinary:", err));
      
      await cloudinary.uploader.destroy(thumbnailPublicId)
        .catch(err => console.warn("Warning: Couldn't delete thumbnail from Cloudinary:", err));
    } catch (err) {
      console.error("Error deleting files from Cloudinary:", err);
      // Continue with deletion from database even if Cloudinary deletion fails
    }
    
    // Delete video from database
    await Video.findByIdAndDelete(videoId);
    
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error("Error deleting video:", err);
    res.status(500).json({ message: err.message });
  }
};


