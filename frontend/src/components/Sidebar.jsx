import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const { user } = useContext(AuthContext);

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
        
        {user && (
          <>
            <li>
              <Link to="/subscriptions" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>📺</span>
                <span>Subscriptions</span>
              </Link>
            </li>
            
            <li className="border-t my-4 pt-4">
              <Link to="/history" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>🕒</span>
                <span>History</span>
              </Link>
            </li>
            
            <li>
              <Link to="/playlists" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>📋</span>
                <span>Playlists</span>
              </Link>
            </li>
            
            <li>
              <Link to="/your-videos" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>�</span>
                <span>Your videos</span>
              </Link>
            </li>
            
            <li>
              <Link to="/watch-later" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>⏰</span>
                <span>Watch later</span>
              </Link>
            </li>
            
            <li>
              <Link to="/liked-videos" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>�</span>
                <span>Liked videos</span>
              </Link>
            </li>
            
            <li className="border-t my-4 pt-4">
              <Link to="/upload" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                <span>📤</span>
                <span>Upload Video</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
