import jwt from "jsonwebtoken";

// This middleware will attempt to verify a token if present,
// but will not reject the request if no token is provided
export const optionalAuth = (req, res, next) => {
  try {
    // Check for token in cookies first - try both "token" and "jwt" cookie names
    let token = req.cookies.token || req.cookies.jwt;
    
    // If no cookie token, check for Authorization header
    if (!token && req.headers.authorization) {
      // Format should be "Bearer TOKEN"
      const authHeader = req.headers.authorization;
      
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }
    
    // If no token is found, just continue without setting user info
    if (!token) {
      return next();
    }

    // Verify the token using the environment JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // If token is invalid, just continue without setting user info
        return next();
      }
      
      // Set user info in request object
      req.user = user;
      
      // Ensure we have both _id and id for backward compatibility
      if (user.id && !user._id) req.user._id = user.id;
      if (user._id && !user.id) req.user.id = user._id;
      
      next();
    });
  } catch (error) {
    // If any error occurs, just continue without authentication
    next();
  }
};
