import cloudinary from "../utils/cloudinary.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
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
    // Find the video and increment the view count
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Increment views by 1
      { new: true } // Return the updated document
    ).populate("createdBy", "username profilePic");
    
    if (!video) return res.status(404).json({ message: "Video not found" });

    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const likeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    console.log("Like request - Video ID:", videoId, "User ID:", userId);

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    console.log("Current video likes:", video.likes);
    console.log("Current video dislikes:", video.dislikes);
    
    // Check if user already liked the video
    const alreadyLiked = video.likes.includes(userId);
    
    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.includes(userId);
    
    // If already liked, remove the like (toggle)
    if (alreadyLiked) {
      await Video.findByIdAndUpdate(videoId, {
        $pull: { likes: userId }
      });
      return res.status(200).json({ message: "Like removed" });
    }
    
    // If already disliked, remove dislike and add like
    if (alreadyDisliked) {
      await Video.findByIdAndUpdate(videoId, {
        $pull: { dislikes: userId },
        $push: { likes: userId }
      });
      return res.status(200).json({ message: "Dislike removed and like added" });
    }
    
    // Otherwise, just add like
    await Video.findByIdAndUpdate(videoId, {
      $push: { likes: userId }
    });
    
    res.status(200).json({ message: "Video liked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const dislikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    console.log("Dislike request - Video ID:", videoId, "User ID:", userId);
    
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    console.log("Current video likes:", video.likes);
    console.log("Current video dislikes:", video.dislikes);
    
    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.includes(userId);
    
    // Check if user already liked the video
    const alreadyLiked = video.likes.includes(userId);
    
    // If already disliked, remove the dislike (toggle)
    if (alreadyDisliked) {
      await Video.findByIdAndUpdate(videoId, {
        $pull: { dislikes: userId }
      });
      return res.status(200).json({ message: "Dislike removed" });
    }
    
    // If already liked, remove like and add dislike
    if (alreadyLiked) {
      await Video.findByIdAndUpdate(videoId, {
        $pull: { likes: userId },
        $push: { dislikes: userId }
      });
      return res.status(200).json({ message: "Like removed and dislike added" });
    }
    
    // Otherwise, just add dislike
    await Video.findByIdAndUpdate(videoId, {
      $push: { dislikes: userId }
    });
    
    res.status(200).json({ message: "Video disliked" });
  } catch (err) {
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


