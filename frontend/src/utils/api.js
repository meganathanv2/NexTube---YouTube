// src/utils/api.js
const BASE_URL = "http://localhost:5000/api";

// Helper function to get authenticated request headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Check if the current authentication token is valid
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/check/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies
    });
    
    if (!response.ok) {
      return { authenticated: false };
    }
    
    const data = await response.json();
    return { authenticated: true, user: data.user };
  } catch (error) {
    return { authenticated: false };
  }
};

export const fetchVideos = async () => {
  const response = await fetch(`${BASE_URL}/videos`);
  if (!response.ok) throw new Error("Failed to fetch videos");
  return response.json();
};

export const getSingleVideo = async (id) => {
  const response = await fetch(`${BASE_URL}/videos/${id}`);
  if (!response.ok) throw new Error("Failed to fetch video");
  return response.json();
};

export const getRecommendedVideos = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}/recommended`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch recommended videos");
    }
    return response.json();
  } catch (error) {
    return []; // Return empty array instead of throwing to prevent UI breaking
  }
};

export const likeVideo = async (videoId) => {
  try {
    // Use the helper function to get auth headers
    const headers = getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}/videos/${videoId}/like`, {
      method: 'PUT',
      headers: headers,
      credentials: 'include', // Important: Include cookies with the request
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to like video");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const dislikeVideo = async (videoId) => {
  try {
    // Use the helper function to get auth headers
    const headers = getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}/videos/${videoId}/dislike`, {
      method: 'PUT',
      headers: headers,
      credentials: 'include', // Important: Include cookies with the request
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to dislike video");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// Get current user's videos
export const getUserVideos = async () => {
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}/videos/user/videos`, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Special case for when user doesn't have a channel
      if (response.status === 403 && errorData.hasChannel === false) {
        return { 
          hasChannel: false, 
          videos: [] 
        };
      }
      
      throw new Error(errorData.message || "Failed to fetch user videos");
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const uploadVideo = async (formData, progressCallback) => {
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.open('POST', `${BASE_URL}/videos/upload`, true);
    xhr.withCredentials = true; // Needed for cookies (token)
    
    // Set up progress tracking
    if (progressCallback) {
      xhr.upload.addEventListener('progress', progressCallback);
    }
    
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        try {
          const errorData = JSON.parse(xhr.response);
          reject(new Error(errorData.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error during upload'));
    };
    
    xhr.send(formData);
  });
};

export const register = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }
  
  return response.json();
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }
    
    const data = await response.json();
    
    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error("Logout failed");
  return response.json();
};

// Channel related API functions
export const createChannel = async (channelData) => {
  try {
    const response = await fetch(`${BASE_URL}/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(channelData),
    });
    
    // Check the content-type of the response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, server might be down or returning HTML error page
      console.error('Server response is not JSON. Server might be down or returning HTML.');
      throw new Error("Server error: Not returning JSON. Is the server running?");
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create channel");
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in createChannel:', error);
    throw error; // Re-throw the error since this is a user action that needs feedback
  }
};

export const getUserChannel = async () => {
  try {
    const response = await fetch(`${BASE_URL}/channels/me`, {
      credentials: 'include',
    });
    
    // Check the content-type of the response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, server might be down or returning HTML error page
      console.error('Server response is not JSON. Server might be down or returning HTML.');
      return null;
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User doesn't have a channel yet
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch channel");
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in getUserChannel:', error);
    return null; // Return null so the app doesn't crash
  }
};

export const checkUserHasChannel = async () => {
  try {
    const response = await fetch(`${BASE_URL}/channels/check/status`, {
      credentials: 'include',
    });
    
    // Check the content-type of the response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, server might be down or returning HTML error page
      console.error('Server response is not JSON. Server might be down or returning HTML.');
      return { hasChannel: false, error: true };
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to check channel status");
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in checkUserHasChannel:', error);
    // Return a default value so the app doesn't crash
    return { hasChannel: false, error: true };
  }
};

// Watch History API functions
// Fetch watch history with pagination
export const fetchWatchHistory = async (page = 1, limit = 20) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    const response = await fetch(`${BASE_URL}/users/history?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch watch history: ${response.status}`);
      } catch (e) {
        // If parsing fails, use the text directly
        throw new Error(`Failed to fetch watch history: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    
    // Handle different response formats from the backend
    if (data && data.history && Array.isArray(data.history)) {
      // New paginated format
      return data.history;
    } else if (Array.isArray(data)) {
      // Old format directly returning array
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return []; // Return empty array instead of throwing to prevent UI errors
  }
};

// Add video to watch history
export const addToHistory = async (videoId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/users/history/${videoId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || "Failed to add to history" };
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Clear watch history
export const clearWatchHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/users/history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        return { 
          success: false, 
          message: errorData.message || `Failed to clear watch history: ${response.status}`
        };
      } catch (e) {
        // If parsing fails, use the text directly
        return { 
          success: false, 
          message: `Failed to clear watch history: ${response.status}`
        };
      }
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Fetch liked videos
export const fetchLikedVideos = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${BASE_URL}/users/liked-videos`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch liked videos");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Fetch watch later videos
export const fetchWatchLaterVideos = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${BASE_URL}/users/watch-later`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch watch later videos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching watch later videos:", error);
    throw error;
  }
};

// Add video to watch later
export const addToWatchLater = async (videoId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${BASE_URL}/users/watch-later/${videoId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add video to watch later");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to watch later:", error);
    throw error;
  }
};

// Remove video from watch later
export const removeFromWatchLater = async (videoId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${BASE_URL}/users/watch-later/${videoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to remove video from watch later");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing from watch later:", error);
    throw error;
  }
};
// Playlist API functions
export const fetchPlaylists = async () => {
  try {
    const response = await fetch(`${BASE_URL}/playlists`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch playlists");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};

export const fetchPlaylistDetails = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch playlist details");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    throw error;
  }
};

export const createPlaylist = async (playlistData) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(playlistData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create playlist");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete playlist");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/videos/${videoId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add video to playlist");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    throw error;
  }
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to remove video from playlist");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error removing video from playlist:", error);
    throw error;
  }
};

// Fetch videos uploaded by the current user
export const fetchUserVideos = async () => {
  try {
    const headers = getAuthHeaders();
    
    // Using the correct endpoint for user videos
    const response = await fetch(`${BASE_URL}/videos/user/videos`, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Special case for when user doesn't have a channel
      if (response.status === 403 && errorData.hasChannel === false) {
        return { 
          hasChannel: false, 
          videos: [] 
        };
      }
      
      throw new Error(errorData.message || "Failed to fetch user videos");
    }
    
    const data = await response.json();
    console.log("User videos response:", data); // Log response for debugging
    
    // Return the data as is - backend returns { videos, hasChannel }
    return data;
  } catch (error) {
    console.error("Error fetching user videos:", error);
    throw error;
  }
};

// Delete a video by ID
export const deleteVideo = async (videoId) => {
  try {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}/videos/${videoId}`, {
      method: 'DELETE',
      headers: headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete video");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
};
