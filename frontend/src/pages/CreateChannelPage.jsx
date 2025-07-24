import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createChannel } from '../utils/api';

const CreateChannelPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customUrl: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name) {
      setError('Channel name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      try {
        await createChannel(formData);
        
        // Update user in context to reflect they have a channel
        // This happens on the backend, but we could refresh the user data here
        
        // Redirect to profile page after channel creation
        navigate('/profile');
      } catch (err) {
        // Check if it's a connection error (HTML instead of JSON)
        if (err.message && err.message.includes('Not returning JSON')) {
          setError('Cannot connect to server. Please check your connection and try again.');
        } else {
          setError(err.message || 'Failed to create channel');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Unexpected error in form submission:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Your Channel</h1>
        
        <p className="mb-4 text-gray-600">
          Creating a channel allows you to upload videos, build an audience, and engage with the NexTube community.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Channel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-gray-500 text-sm mt-1">
              Choose a name that represents you or your content. This will appear on your channel page and videos.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Channel Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            ></textarea>
            <p className="text-gray-500 text-sm mt-1">
              Tell viewers about your channel. This will appear on your channel page.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="customUrl">
              Custom URL (optional)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                nexttube.com/
              </span>
              <input
                type="text"
                id="customUrl"
                name="customUrl"
                value={formData.customUrl}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Create a custom URL for your channel. Only letters, numbers, and hyphens are allowed.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelPage;
