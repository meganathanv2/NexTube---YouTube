import mongoose from "mongoose";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";

// Create a new channel

export const createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Channel name must be at least 3 characters long" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({ userId });
    if (existingChannel) {
      return res.status(400).json({ message: "User already has a channel" });
    }

    // Create and save new channel
    const newChannel = new Channel({
      userId,
      name: name.trim(),
      description: description || "",
    });

    const savedChannel = await newChannel.save();

    // Update user
    await User.findByIdAndUpdate(userId, { hasChannel: true });

    res.status(201).json(savedChannel);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid channel data", errors: err.errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "User already has a channel" });
    }
    res.status(500).json({ message: "Error creating channel", error: err.message });
  }
};

// Get channel by user ID
export const getChannelByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const channel = await Channel.findOne({ userId });
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    res.status(200).json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching channel", error: err.message });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, banner } = req.body;
    
    // Find the channel by user ID
    const channel = await Channel.findOne({ userId });
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    // Check if this is the user's channel
    if (channel.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own channel" });
    }
    
    // Update channel
    const updatedChannel = await Channel.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          name: name || channel.name,
          description: description !== undefined ? description : channel.description,
          banner: banner || channel.banner
        } 
      },
      { new: true }
    );
    
    res.status(200).json(updatedChannel);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid channel data", errors: err.errors });
    }
    res.status(500).json({ message: "Error updating channel", error: err.message });
  }
};

// Check if user has a channel
export const checkUserChannel = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const hasChannel = user.hasChannel;
    
    res.status(200).json({ hasChannel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking channel status", error: err.message });
  }
};