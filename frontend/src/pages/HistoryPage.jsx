import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchWatchHistory, clearWatchHistory } from '../utils/api';

const HistoryPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchWatchHistory();
      
      // Ensure data is a valid array
      if (!Array.isArray(data)) {
        setError('Invalid history data format received from server');
        setVideos([]);
        setLoading(false);
        return;
      }
      
      if (data.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }
      
      // Log details about each video in history
      data.forEach((video, index) => {
      });
      
      // Filter out any videos with missing data
      const validVideos = data.filter(video => {
        const isValid = video && video._id && video.title && video.thumbnailUrl && video.createdBy;
        return isValid;
      });
      
      setVideos(validVideos);
    } catch (err) {
      setError('Failed to load watch history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your watch history? This cannot be undone.')) {
      try {
        setLoading(true);
        const result = await clearWatchHistory();
        
        if (result.success) {
          setVideos([]);
          setError(null);
        } else {
          setError(`Failed to clear watch history: ${result.message}`);
        }
      } catch (err) {
        setError('Failed to clear watch history. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Watch History</h1>
        <p className="mb-4">Please log in to view your watch history.</p>
        <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Log In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => {
            loadHistory();
          }}
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
        <h1 className="text-2xl font-bold mb-4">Watch History</h1>
        <p className="mb-4">Your watch history is empty.</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Watch History</h1>
        {videos.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear History
          </button>
        )}
      </div>
      
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
              <p className="text-gray-600 text-sm mb-2">
                {video.views} views • Watched on {new Date(video.viewedAt || video.updatedAt || video.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="flex items-center mt-2">
                <Link to={`/channel/${video.createdBy._id}`} className="flex items-center">
                  <img 
                    src={video.createdBy.profilePic || 'https://via.placeholder.com/40'} 
                    alt={video.createdBy.username}
                    className="w-8 h-8 rounded-full mr-2" 
                  />
                  <span className="text-sm text-gray-700">{video.createdBy.username}</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
