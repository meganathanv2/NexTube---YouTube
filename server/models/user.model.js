import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" },
  hasChannel: { type: Boolean, default: false },
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  history: {
    type: [{
      video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
      watchedAt: { type: Date, default: Date.now }
    }],
    default: [] // Explicitly set default to empty array
  }
}, { timestamps: true });

// Index for faster queries on history.video
userSchema.index({ 'history.video': 1 });

export default mongoose.model("User", userSchema);