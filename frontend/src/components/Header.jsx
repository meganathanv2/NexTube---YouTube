import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logout as apiLogout } from '../utils/api';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await apiLogout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">NexTube</Link>
      
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="border p-2 rounded w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Upload
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button 
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">{user.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    Signed in as <span className="font-medium">{user.username}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex space-x-2">
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Log In
            </Link>
            <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
