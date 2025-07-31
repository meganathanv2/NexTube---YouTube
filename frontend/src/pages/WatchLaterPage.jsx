import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchWatchHistory, clearWatchHistory } from '../utils/api';

const WatchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const limit = 10; // Matches backend default

  useEffect(() => {
    const loadWatchHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchWatchHistory(currentPage, limit);
        setHistory(data.history);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setError(null);
      } catch (err) {
        console.error('Error fetching watch history:', err);
        setError('Failed to load watch history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWatchHistory();
    }
  }, [user, currentPage]);

  const handleClearHistory = async () => {
    try {
      await clearWatchHistory();
      setHistory([]);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error clearing watch history:', err);
      setError('Failed to clear watch history. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Watch History</h1>
        <p className="mb-4">Please log in to view your watch history.</p>
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log In
        </Link>
      </div>
    );
  }

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

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Watch History</h1>
        <p className="mb-4">You haven't watched any videos yet.</p>
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
        <button
          onClick={handleClearHistory}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map(video => (
          <div key={video._id} className="bg-white rounded-lg shadow overflow-hidden">
            <Link to={`/video/${video._id}`}>
              <img
                src={video.thumbnailUrl || 'https://via.placeholder.com/300x200'}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/video/${video._id}`}>
                <h2 className="text-lg font-semibold mb-2 hover:text-blue-500">{video.title}</h2>
              </Link>
              <p className="text-gray-600 text-sm mb-2">
                {video.views} views • Watched on {new Date(video.viewedAt).toLocaleDateString()}
              </p>
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
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchHistoryPage;