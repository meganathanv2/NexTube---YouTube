import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    console.log(`Verifying token for ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Check for token in cookies first - try both "token" and "jwt" cookie names
    let token = req.cookies.token || req.cookies.jwt;
    console.log("Cookie token:", token ? "exists" : "missing");
    
    // If no cookie token, check for Authorization header
    if (!token && req.headers.authorization) {
      // Format should be "Bearer TOKEN"
      const authHeader = req.headers.authorization;
      console.log("Authorization header:", authHeader);
      
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log("Token from Authorization header:", token.substring(0, 10) + "...");
      }
    }
    
    console.log("Final token status:", token ? "found" : "missing");
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Log JWT secret availability (without revealing it)
    console.log("JWT_SECRET available:", !!process.env.JWT_SECRET);
    
    // Verify the token using the environment JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Invalid token - " + err.message });
      }
      
      console.log("User from token:", user);
      req.user = user;
      
      // Ensure we have both _id and id for backward compatibility
      if (user.id && !user._id) req.user._id = user.id;
      if (user._id && !user.id) req.user.id = user._id;
      
      console.log("User ID set to:", req.user.id);
      next();
    });
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    return res.status(500).json({ message: "Internal server error in auth middleware" });
  }
};
