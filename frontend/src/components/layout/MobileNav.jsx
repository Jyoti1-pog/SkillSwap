import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, ChatBubbleLeftRightIcon, BellIcon, SparklesIcon } from '@heroicons/react/24/outline';
import useUIStore from '../../store/uiStore';
import { clsx } from 'clsx';

const items = [
  { to: '/dashboard', icon: HomeIcon, label: 'Home' },
  { to: '/discover', icon: UsersIcon, label: 'Discover' },
  { to: '/matches', icon: SparklesIcon, label: 'Matches' },
  { to: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Chat' },
  { to: '/notifications', icon: BellIcon, label: 'Alerts' },
];

export default function MobileNav() {
  const { unreadNotifications, unreadMessages } = useUIStore();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-20">
      <div className="flex">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            clsx('flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400')
          }>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {label === 'Alerts' && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full" />
              )}
              {label === 'Chat' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full" />
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
