import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSingleVideo, getRecommendedVideos, likeVideo, dislikeVideo } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const VideoPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const videoRef = useRef(null);
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await getSingleVideo(id);
        setVideo(videoData);
        
        // Check if user has liked/disliked the video
        if (user) {
          // Check both id and _id to handle different formats
          const userId = user.id || user._id;
          console.log("Checking likes for user ID:", userId);
          console.log("Video likes:", videoData.likes);
          console.log("Video dislikes:", videoData.dislikes);
          
          // Convert ObjectId to string for proper comparison
          const userIdStr = userId.toString();
          setIsLiked(videoData.likes?.some(likeId => {
            const idStr = typeof likeId === 'string' ? likeId : likeId.toString();
            return idStr === userIdStr;
          }));
          setIsDisliked(videoData.dislikes?.some(dislikeId => {
            const idStr = typeof dislikeId === 'string' ? dislikeId : dislikeId.toString();
            return idStr === userIdStr;
          }));
          
          // These console logs won't show updated state due to React's state batching
          // They'll show the previous state values
          console.log("isLiked state will be updated to:", isLiked);
          console.log("isDisliked state will be updated to:", isDisliked);
        } else {
          // Reset like/dislike state when not logged in
          setIsLiked(false);
          setIsDisliked(false);
        }
        
        try {
          // Fetch recommended videos
          const recommended = await getRecommendedVideos(id);
          setRecommendedVideos(recommended || []);
        } catch (recError) {
          console.error("Failed to load recommended videos:", recError);
          setRecommendedVideos([]); // Set empty array if recommendations fail
        }
      } catch (err) {
        setError(err.message || 'Failed to load video');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideo();
  }, [id, user]);
  
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like videos");
      return;
    }
    
    // Check if we have a token (but don't check it directly to avoid alert)
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found in localStorage, but trying request anyway");
    }
    
    try {
      // Use either id or _id to ensure compatibility
      const userId = user.id || user._id;
      console.log("Liking video with user ID:", userId);
      
      const response = await likeVideo(id);
      console.log("Like response:", response);
      
      // Update the video state with the new likes/dislikes arrays from the response
      if (response.likes && response.dislikes) {
        setVideo(prev => ({
          ...prev,
          likes: response.likes,
          dislikes: response.dislikes
        }));
        
        // Update UI state based on presence of userId in arrays
        const userIdStr = userId.toString();
        setIsLiked(response.likes.some(id => id === userId || id.toString() === userIdStr));
        setIsDisliked(response.dislikes.some(id => id === userId || id.toString() === userIdStr));
      } else {
        // Fallback to the old UI update logic if the response doesn't include arrays
        setVideo(prev => {
          // If already liked, remove like
          if (isLiked) {
            return {
              ...prev,
              likes: prev.likes.filter(likeId => likeId.toString() !== userId.toString())
            };
          }
          
          // If previously disliked, remove dislike and add like
          if (isDisliked) {
            return {
              ...prev,
              likes: [...prev.likes, userId],
              dislikes: prev.dislikes.filter(dislikeId => dislikeId.toString() !== userId.toString())
            };
          }
          
          // Otherwise add like
          return {
            ...prev,
            likes: [...prev.likes, userId]
          };
        });
        
        setIsLiked(!isLiked);
        if (isDisliked) setIsDisliked(false);
      }
    } catch (err) {
      console.error("Failed to like video:", err);
      if (err.message && err.message.includes("Unauthorized")) {
        alert("Your session has expired. Please log in again.");
      } else {
        alert("Failed to like video: " + (err.message || "Unknown error"));
      }
    }
  };
  
  const handleDislike = async () => {
    if (!user) {
      alert("Please log in to dislike videos");
      return;
    }
    
    // Check if we have a token (but don't check it directly to avoid alert)
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found in localStorage, but trying request anyway");
    }
    
    try {
      // Use either id or _id to ensure compatibility
      const userId = user.id || user._id;
      console.log("Disliking video with user ID:", userId);
      
      const response = await dislikeVideo(id);
      console.log("Dislike response:", response);
      
      // Update the video state with the new likes/dislikes arrays from the response
      if (response.likes && response.dislikes) {
        setVideo(prev => ({
          ...prev,
          likes: response.likes,
          dislikes: response.dislikes
        }));
        
        // Update UI state based on presence of userId in arrays
        const userIdStr = userId.toString();
        setIsLiked(response.likes.some(id => id === userId || id.toString() === userIdStr));
        setIsDisliked(response.dislikes.some(id => id === userId || id.toString() === userIdStr));
      } else {
        // Fallback to the old UI update logic if the response doesn't include arrays
        setVideo(prev => {
          // If already disliked, remove dislike
          if (isDisliked) {
            return {
              ...prev,
              dislikes: prev.dislikes.filter(dislikeId => dislikeId.toString() !== userId.toString())
            };
          }
          
          // If previously liked, remove like and add dislike
          if (isLiked) {
            return {
              ...prev,
              dislikes: [...prev.dislikes, userId],
              likes: prev.likes.filter(likeId => likeId.toString() !== userId.toString())
            };
          }
          
          // Otherwise add dislike
          return {
            ...prev,
            dislikes: [...prev.dislikes, userId]
          };
        });
        
        setIsDisliked(!isDisliked);
        if (isLiked) setIsLiked(false);
      }
    } catch (err) {
      console.error("Failed to dislike video:", err);
      if (err.message && err.message.includes("Unauthorized")) {
        alert("Your session has expired. Please log in again.");
      } else {
        alert("Failed to dislike video: " + (err.message || "Unknown error"));
      }
    }
  };
  
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareOptions(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!video) {
    return (
      <div className="text-center text-gray-500 py-20">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Column */}
        <div className="lg:col-span-2">
          <div className="bg-black w-full rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              src={video.videoUrl} 
              controls
              autoPlay
              className="w-full h-auto"
              poster={video.thumbnailUrl}
            />
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            
            <div className="flex justify-between items-center my-4">
              <div className="flex items-center">
                <span className="text-gray-500">{video.views || 0} views</span>
                <span className="mx-2">•</span>
                <span className="text-gray-500">{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${isLiked ? 'text-blue-600' : 'text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{video.likes?.length || 0}</span>
                </button>
                
                <button 
                  onClick={handleDislike}
                  className={`flex items-center space-x-1 ${isDisliked ? 'text-red-600' : 'text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>{video.dislikes?.length || 0}</span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  
                  {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={copyToClipboard}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy link
                      </button>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Share on Facebook
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(video.title)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Share on Twitter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <hr className="my-4 border-gray-300" />
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                {video.createdBy?.profilePic ? (
                  <img 
                    src={video.createdBy.profilePic} 
                    alt={video.createdBy.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700">
                      {video.createdBy?.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="font-medium">{video.createdBy?.username || "Unknown creator"}</p>
                <p className="text-sm text-gray-500">
                  {video.createdBy?.subscribers || 0} subscribers
                </p>
              </div>
              
              <button className="ml-auto bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">
                Subscribe
              </button>
            </div>
            
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <p className="whitespace-pre-line">{video.description || "No description available."}</p>
            </div>
            
            {/* Comments section could go here */}
          </div>
        </div>
        
        {/* Recommended Videos Column */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold mb-4">Recommended Videos</h3>
          <div className="space-y-4">
            {recommendedVideos.length > 0 ? (
              recommendedVideos.map((recVideo) => (
                <Link to={`/video/${recVideo._id}`} key={recVideo._id} className="block">
                  <div className="flex space-x-2 hover:bg-gray-100 rounded-lg p-2">
                    <div className="w-40 h-24 bg-gray-300 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={recVideo.thumbnailUrl} 
                        alt={recVideo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-2">{recVideo.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{recVideo.createdBy?.username}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{recVideo.views || 0} views</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(recVideo.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recommended videos available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
