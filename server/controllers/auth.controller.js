import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();
    res.status(201).json("User registered successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid credentials");

    // Include both id and _id for compatibility
    const token = jwt.sign({ 
      id: user._id,
      _id: user._id 
    }, process.env.JWT_SECRET, { expiresIn: "3d" });
    
    res.cookie("token", token, { httpOnly: true });
    
    // Make sure the user object returned has both formats as well
    const userResponse = user.toObject();
    if (userResponse._id && !userResponse.id) userResponse.id = userResponse._id;
    
    res.status(200).json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json("User logged out successfully");
};