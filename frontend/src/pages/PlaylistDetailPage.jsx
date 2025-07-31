import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPlaylistDetails, removeVideoFromPlaylist } from '../utils/api';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlaylistDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchPlaylistDetails(id);
        setPlaylist(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlist details:', err);
        setError('Failed to load playlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylistDetails();
  }, [id]);

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(id, videoId);
      // Update the playlist state to remove the video
      setPlaylist({
        ...playlist,
        videos: playlist.videos.filter(video => video._id !== videoId)
      });
    } catch (err) {
      console.error('Error removing video from playlist:', err);
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

  if (error || !playlist) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'Playlist not found'}</p>
        <Link 
          to="/playlists" 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
        >
          Back to Playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Link 
          to="/playlists" 
          className="text-blue-500 hover:underline mb-4 inline-block"
        >
          ← Back to Playlists
        </Link>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-gray-700 mt-2">{playlist.description}</p>
        )}
        <p className="text-gray-600 text-sm mt-2">
          {playlist.videos.length} videos • Created {new Date(playlist.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      {playlist.videos.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="mb-4">This playlist is empty.</p>
          <Link 
            to="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            Browse Videos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {playlist.videos.map((video, index) => (
            <div 
              key={video._id} 
              className={`flex border-b ${index === playlist.videos.length - 1 ? '' : 'border-gray-200'}`}
            >
              <div className="w-1/3 sm:w-1/4 p-2">
                <Link to={`/video/${video._id}`}>
                  <img 
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-24 object-cover rounded"
                  />
                </Link>
              </div>
              <div className="w-2/3 sm:w-3/4 p-4 flex flex-col justify-between">
                <div>
                  <Link to={`/video/${video._id}`}>
                    <h3 className="font-semibold hover:text-blue-500">{video.title}</h3>
                  </Link>
                  <Link to={`/channel/${video.createdBy._id}`} className="flex items-center mt-1">
                    <span className="text-sm text-gray-700">{video.createdBy.username}</span>
                  </Link>
                  <p className="text-gray-600 text-xs mt-1">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove from playlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;
