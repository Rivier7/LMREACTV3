import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const { token, logout } = useAuth();

  let userEmail = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userEmail = decoded.sub || decoded.email || 'User';
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  return (
    <header className="relative flex items-center bg-gray-950 text-white px-6 py-3 shadow-md">
      {/* Left: Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Marken" className="h-10 w-auto object-contain" />
      </div>

      {/* Center: Nav */}
      <div className="flex flex-col items-center mx-auto">
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/dashboard" className="text-lg hover:text-blue-500 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/lanes" className="text-lg hover:text-blue-500 transition-colors">
                Lanes
              </Link>
            </li>
            <li>
              <Link to="/accounts" className="text-lg hover:text-blue-500 transition-colors">
                Accounts
              </Link>
            </li>
            <li>
              <Link to="/flights" className="text-lg hover:text-blue-500 transition-colors">
                Flight Search
              </Link>
            </li>
          </ul>
        </nav>
      </div>


      {/* Right: User info and Logout */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-4">
        {userEmail && <span className="text-sm text-gray-300">{userEmail}</span>}
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
