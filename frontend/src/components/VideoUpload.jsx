import { useState } from 'react';
import { uploadVideo } from '../utils/api';

const VideoUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !videoFile || !thumbnailFile) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // Create FormData instead of using base64
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);
      
      // Track upload progress
      const uploadProgress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setProgress(percentage);
        }
      };

      const response = await uploadVideo(formData, uploadProgress);
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      
      // Reset file input fields
      document.getElementById('video-file').value = '';
      document.getElementById('thumbnail-file').value = '';
      
    } catch (err) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Upload Video</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Video uploaded successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="4"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="video-file">
            Video File *
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Supported formats: MP4, WebM, Ogg (max size: 100MB)
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="thumbnail-file">
            Thumbnail Image *
          </label>
          <input
            id="thumbnail-file"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recommended resolution: 1280x720px (16:9 aspect ratio)
          </p>
        </div>
        
        {loading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
              {progress}% uploaded
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
