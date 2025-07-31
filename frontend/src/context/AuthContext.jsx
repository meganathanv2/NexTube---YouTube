import { createContext, useState, useEffect } from 'react';
import { checkAuthStatus } from '../utils/api';

// Create auth context
export const AuthContext = createContext();

// Create the auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const validateAuth = async () => {
      try {
        // First try to get stored credentials
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          console.log("Found stored credentials");
          
          // Set from localStorage immediately for a better UX
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Then validate the token with the server
          const { authenticated } = await checkAuthStatus();
          
          if (!authenticated) {
            console.warn("Stored token is invalid, logging out");
            // Clear stored credentials if token is invalid
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          console.log("No stored credentials found");
        }
      } catch (error) {
        console.error("Error checking authentication state:", error);
        // Clear potentially corrupted storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    validateAuth();
  }, []);

  // Login function
  const login = (userData, userToken) => {
    try {
      console.log("Logging in user:", userData.username || userData.email);
      
      if (!userToken) {
        console.warn("No token provided during login!");
      } else {
        console.log("Token received (first 15 chars):", userToken.substring(0, 15) + "...");
        setToken(userToken);
        localStorage.setItem('token', userToken);
      }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out user");
      
      // Call the logout API endpoint to clear cookies server-side
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log("Server-side logout successful");
      } else {
        console.warn("Server-side logout failed, but continuing client-side logout");
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      // Always clear client-side state regardless of API call success
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
