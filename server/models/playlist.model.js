import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: "" 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  videos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Video" 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default mongoose.model("Playlist", playlistSchema);
