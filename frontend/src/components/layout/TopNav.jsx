import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, BellIcon, SunIcon, MoonIcon, Bars3Icon,
  ArrowRightOnRectangleIcon, UserCircleIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar, unreadNotifications } = useUIStore();
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/discover?q=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-20 flex items-center px-4 gap-4">
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bars3Icon className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people, skills..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <Link to="/notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <BellIcon className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
          )}
        </Link>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar user={user} size="sm" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-card-xl overflow-hidden z-50 animate-scale-in">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <Link
                  to="/profile/me"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  View Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Settings
                </Link>
                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
