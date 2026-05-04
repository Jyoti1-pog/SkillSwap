import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  HomeIcon, UsersIcon, ChatBubbleLeftRightIcon, CalendarIcon,
  BellIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  SparklesIcon, StarIcon, ShieldCheckIcon, ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const navItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/discover', icon: UsersIcon, label: 'Discover' },
  { to: '/matches', icon: SparklesIcon, label: 'Matches' },
  { to: '/requests', icon: ArrowsRightLeftIcon, label: 'Requests' },
  { to: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
  { to: '/sessions', icon: CalendarIcon, label: 'Sessions' },
  { to: '/reviews', icon: StarIcon, label: 'Reviews' },
  { to: '/notifications', icon: BellIcon, label: 'Notifications' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, unreadNotifications, unreadMessages } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-gradient">SkillSwap</span>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(isActive ? 'sidebar-link-active' : 'sidebar-link')}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {label === 'Notifications' && unreadNotifications > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
            {label === 'Messages' && unreadMessages > 0 && (
              <span className="ml-auto bg-accent-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => clsx(isActive ? 'sidebar-link-active' : 'sidebar-link', 'mt-2 border-t border-gray-100 dark:border-gray-800 pt-3')}>
            <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <NavLink to="/profile/me" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">View profile</p>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full mt-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
