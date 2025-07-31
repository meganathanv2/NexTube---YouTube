import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Add a status check endpoint to test token validation
router.get("/check/status", verifyToken, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Token is valid", 
    user: { id: req.user.id } 
  });
});

export default router;
