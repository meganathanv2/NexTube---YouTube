import { Link } from 'react-router-dom';

function VideoCard({ video }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/video/${video._id}`}>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-3">
        <Link to={`/video/${video._id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-blue-600">{video.title}</h3>
        </Link>
        <p className="text-sm text-gray-600">{video.createdBy?.username || "Unknown creator"}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <span>{video.views || 0} views</span>
          <span className="mx-1">•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
