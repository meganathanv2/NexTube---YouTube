import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    match: /^[a-zA-Z0-9\s]+$/
  },
  description: { 
    type: String, 
    default: "" 
  },
  banner: { 
    type: String, 
    default: "" 
  },
  subscribers: { 
    type: Number, 
    default: 0 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Cascade delete: Update user when channel is deleted
channelSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  await mongoose.model('User').findByIdAndUpdate(this.userId, { hasChannel: false });
  next();
});

export default mongoose.model("Channel", channelSchema);