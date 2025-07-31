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

    console.log("Creating token for user:", user._id);
    
    // Use the environment JWT_SECRET set in index.js
    console.log("JWT_SECRET available:", !!process.env.JWT_SECRET);
    
    // Include both id and _id for compatibility
    const token = jwt.sign({ 
      id: user._id.toString(),
    }, process.env.JWT_SECRET, { expiresIn: "3d" });
    
    // Set token as HTTP-only cookies with both names for compatibility
    res.cookie("token", token, { 
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
      sameSite: 'lax'
    });
    
    // Also set as 'jwt' for compatibility with existing cookies
    // res.cookie("jwt", token, { 
    //   httpOnly: true,
    //   maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    //   sameSite: 'lax'
    // });
    
    // Make sure the user object returned has both formats as well
    const userResponse = user.toObject();
    if (userResponse._id && !userResponse.id) userResponse.id = userResponse._id.toString();
    
    console.log("Generated token (first 20 chars):", token.substring(0, 20) + "...");
    console.log("User response:", { id: userResponse.id, _id: userResponse._id });
    
    // Return both the token and the user information
    res.status(200).json({ 
      user: userResponse, 
      token,
      message: "Login successful" 
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
export const logout = (req, res) => {
  console.log("Logging out user");
  // Clear both cookie versions
  res.clearCookie("token");
  res.clearCookie("jwt");
  res.status(200).json({ message: "User logged out successfully" });
};