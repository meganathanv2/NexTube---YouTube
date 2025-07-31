import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchWatchLaterVideos } from '../utils/api';

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadWatchLaterVideos = async () => {
      try {
        setLoading(true);
        const data = await fetchWatchLaterVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching watch later videos:', err);
        setError('Failed to load watch later videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWatchLaterVideos();
    }
  }, [user]);

  const handleRemoveVideo = async (videoId) => {
    try {
      // Implement this function in your API
      // await removeFromWatchLater(videoId);
      setVideos(videos.filter(video => video._id !== videoId));
    } catch (err) {
      console.error('Error removing video from watch later:', err);
      setError('Failed to remove video. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Watch Later</h1>
        <p className="mb-4">You haven't added any videos to watch later.</p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Discover Videos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Watch Later</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video._id} className="bg-white rounded-lg shadow overflow-hidden">
            <Link to={`/video/${video._id}`}>
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/video/${video._id}`}>
                <h2 className="text-lg font-semibold mb-2 hover:text-blue-500">{video.title}</h2>
              </Link>
              <p className="text-gray-600 text-sm mb-2">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center mb-2">
                <Link to={`/channel/${video.createdBy._id}`} className="flex items-center">
                  <img 
                    src={video.createdBy.profilePic || 'https://via.placeholder.com/40'} 
                    alt={video.createdBy.username}
                    className="w-8 h-8 rounded-full mr-2" 
                  />
                  <span className="text-sm text-gray-700">{video.createdBy.username}</span>
                </Link>
              </div>
              <button
                onClick={() => handleRemoveVideo(video._id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove from Watch Later
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchLaterPage;
