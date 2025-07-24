import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserChannel, checkUserHasChannel } from '../utils/api';

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [hasChannel, setHasChannel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user's channel information
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user has a channel
        const response = await checkUserHasChannel();
        
        // Check if there was an error with the API
        if (response.error) {
          setError("Unable to connect to server. Please try again later.");
          return;
        }
        
        setHasChannel(response.hasChannel);

        if (response.hasChannel) {
          // If they have a channel, fetch the details
          const channelData = await getUserChannel();
          if (channelData) {
            setChannel(channelData);
          } else {
            // This shouldn't happen - user has channel but no data
            console.warn("User has a channel but no channel data was returned");
          }
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [user, navigate]);

  const handleCreateChannel = () => {
    navigate('/create-channel');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-medium">{user.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Account Details</h3>
            <p><span className="text-gray-600">Username:</span> {user.username}</p>
            <p><span className="text-gray-600">Email:</span> {user.email}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Channel Status</h3>
            {hasChannel ? (
              <>
                <p className="text-green-600 mb-2">You have a channel!</p>
                <a href="/channel" className="text-blue-600 hover:underline">View your channel</a>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-2">You don't have a channel yet.</p>
                <button 
                  onClick={handleCreateChannel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Create a Channel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {hasChannel && channel && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Channel</h2>
          
          <div className="mb-4">
            <p><span className="font-semibold">Channel Name:</span> {channel.name}</p>
            <p><span className="font-semibold">Description:</span> {channel.description || 'No description'}</p>
            <p><span className="font-semibold">Subscribers:</span> {channel.subscribers}</p>
            {channel.customUrl && (
              <p><span className="font-semibold">Custom URL:</span> {channel.customUrl}</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <a 
              href="/upload" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Upload Video
            </a>
            <a 
              href="/channel/edit" 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Edit Channel
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
