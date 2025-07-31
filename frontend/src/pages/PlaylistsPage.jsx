import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchPlaylists, createPlaylist, deletePlaylist } from '../utils/api';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoading(true);
        const data = await fetchPlaylists();
        setPlaylists(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Failed to load playlists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    try {
      const newPlaylist = await createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription
      });
      
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await deletePlaylist(playlistId);
      setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError('Failed to delete playlist. Please try again.');
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

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Create Playlist'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Playlist</h2>
          <form onSubmit={handleCreatePlaylist}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playlistName">
                Name
              </label>
              <input
                id="playlistName"
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playlistDescription">
                Description (Optional)
              </label>
              <textarea
                id="playlistDescription"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          </form>
        </div>
      )}
      
      {playlists.length === 0 && !showCreateForm ? (
        <div className="text-center py-10">
          <p className="mb-4">You don't have any playlists yet.</p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <div key={playlist._id} className="bg-white rounded-lg shadow overflow-hidden">
              <Link to={`/playlist/${playlist._id}`}>
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {playlist.videos && playlist.videos.length > 0 ? (
                    <img 
                      src={playlist.videos[0].thumbnailUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-4xl">🎵</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/playlist/${playlist._id}`}>
                  <h2 className="text-lg font-semibold mb-2 hover:text-blue-500">{playlist.name}</h2>
                </Link>
                <p className="text-gray-600 text-sm mb-2">
                  {playlist.videos ? playlist.videos.length : 0} videos • Created {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
                {playlist.description && (
                  <p className="text-gray-700 text-sm mb-4">{playlist.description}</p>
                )}
                <button 
                  onClick={() => handleDeletePlaylist(playlist._id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete playlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
