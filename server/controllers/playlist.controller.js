import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }
    
    const newPlaylist = new Playlist({
      name,
      description: description || "",
      createdBy: userId,
      isPublic: isPublic || false,
      videos: []
    });
    
    await newPlaylist.save();
    
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all playlists for the current user
export const getPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const playlists = await Playlist.find({ createdBy: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "videos",
        select: "title thumbnailUrl views createdAt",
        options: { limit: 1 }  // Only get the first video for thumbnail purposes
      });
    
    res.status(200).json(playlists);
  } catch (err) {
    console.error("Error getting playlists:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get a specific playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    // Find the playlist
    const playlist = await Playlist.findById(playlistId)
      .populate({
        path: "videos",
        populate: {
          path: "createdBy",
          select: "username profilePic"
        }
      });
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    // Check if the user owns the playlist or if it's public
    if (playlist.createdBy.toString() !== userId && !playlist.isPublic) {
      return res.status(403).json({ message: "You don't have access to this playlist" });
    }
    
    res.status(200).json(playlist);
  } catch (err) {
    console.error("Error getting playlist:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    // Check if the user owns the playlist
    if (playlist.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own playlists" });
    }
    
    // Delete the playlist
    await Playlist.findByIdAndDelete(playlistId);
    
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (err) {
    console.error("Error deleting playlist:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add a video to a playlist
export const addVideoToPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const userId = req.user.id;
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid playlist or video ID" });
    }
    
    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Check if the playlist exists and the user owns it
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    if (playlist.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only modify your own playlists" });
    }
    
    // Add video to playlist if it's not already there
    if (!playlist.videos.includes(videoId)) {
      await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
      );
    }
    
    res.status(200).json({ message: "Video added to playlist" });
  } catch (err) {
    console.error("Error adding video to playlist:", err);
    res.status(500).json({ message: err.message });
  }
};

// Remove a video from a playlist
export const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const userId = req.user.id;
    
    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid playlist or video ID" });
    }
    
    // Check if the playlist exists and the user owns it
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    if (playlist.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only modify your own playlists" });
    }
    
    // Remove video from playlist
    await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    );
    
    res.status(200).json({ message: "Video removed from playlist" });
  } catch (err) {
    console.error("Error removing video from playlist:", err);
    res.status(500).json({ message: err.message });
  }
};
