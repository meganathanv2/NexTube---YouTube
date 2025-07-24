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
