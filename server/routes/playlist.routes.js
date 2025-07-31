import express from "express";
import { 
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist
} from "../controllers/playlist.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createPlaylist);
router.get("/", verifyToken, getPlaylists);
router.get("/:id", verifyToken, getPlaylistById);
router.delete("/:id", verifyToken, deletePlaylist);
router.post("/:playlistId/videos/:videoId", verifyToken, addVideoToPlaylist);
router.delete("/:playlistId/videos/:videoId", verifyToken, removeVideoFromPlaylist);

export default router;
