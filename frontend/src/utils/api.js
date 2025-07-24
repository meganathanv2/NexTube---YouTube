// src/utils/api.js
const BASE_URL = "http://localhost:5000/api";

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
    console.error("Error fetching recommended videos:", error);
    return []; // Return empty array instead of throwing to prevent UI breaking
  }
};

export const likeVideo = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to like video");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error liking video:", error);
    throw error;
  }
};

export const dislikeVideo = async (videoId) => {
  try {
    const response = await fetch(`${BASE_URL}/videos/${videoId}/dislike`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to dislike video");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error disliking video:", error);
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
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }
  
  return response.json();
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
