import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import {
  LayoutDashboard,
  Route,
  Building2,
  Plane,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lanes', label: 'Lanes', icon: Route },
  { path: '/accounts', label: 'Accounts', icon: Building2 },
  { path: '/flights', label: 'Flight Search', icon: Plane },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { token, logout } = useAuth();
  const location = useLocation();

  let userEmail = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userEmail = decoded.sub || decoded.email || 'User';
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-950 text-white flex flex-col transition-all duration-300 z-50 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <img src="/logo.png" alt="Marken" className="h-9 w-auto object-contain" />
        )}
        {collapsed && (
          <img src="/logo.png" alt="Marken" className="h-8 w-8 object-contain" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      active ? '' : 'group-hover:scale-110'
                    }`}
                  />
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-gray-800 border border-gray-700 rounded-full p-1.5 hover:bg-gray-700 transition-colors shadow-lg"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-gray-400" />
        ) : (
          <ChevronLeft size={14} className="text-gray-400" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t border-gray-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-900/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`mt-3 flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
