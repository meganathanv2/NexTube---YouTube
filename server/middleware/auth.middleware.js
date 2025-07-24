import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    
    console.log("User from token:", user);
    req.user = user;
    
    // Ensure we have both _id and id for backward compatibility
    if (user.id && !user._id) req.user._id = user.id;
    if (user._id && !user.id) req.user.id = user._id;
    
    next();
  });
};
