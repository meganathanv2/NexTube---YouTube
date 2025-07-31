import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchUserVideos, deleteVideo } from '../utils/api';

const UserVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const data = await fetchUserVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user videos:', err);
        setError('Failed to load your videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadVideos();
    }
  }, [user]);

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(videoId);
        // Remove the deleted video from the state
        setVideos(videos.filter(video => video._id !== videoId));
      } catch (err) {
        console.error('Error deleting video:', err);
        setError('Failed to delete the video. Please try again.');
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
        <h1 className="text-2xl font-bold mb-4">Your Videos</h1>
        <p className="mb-4">You haven't uploaded any videos yet.</p>
        <Link 
          to="/upload" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload Your First Video
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Videos</h1>
        <Link 
          to="/upload" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload New Video
        </Link>
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
              <p className="text-gray-600 text-sm mb-2">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{video.description}</p>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => handleDeleteVideo(video._id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserVideosPage;
