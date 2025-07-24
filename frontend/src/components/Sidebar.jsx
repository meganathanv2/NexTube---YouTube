import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow p-4 hidden md:block">
      <ul className="space-y-4">
        <li>
          <Link to="/" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <span>🏠</span>
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/trending" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <span>🔥</span>
            <span>Trending</span>
          </Link>
        </li>
        <li>
          <Link to="/subscriptions" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <span>📺</span>
            <span>Subscriptions</span>
          </Link>
        </li>
        <li className="border-t my-4 pt-4">
          <Link to="/upload" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <span>📤</span>
            <span>Upload Video</span>
          </Link>
        </li>
        <li>
          <Link to="/your-videos" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
            <span>📹</span>
            <span>Your Videos</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
