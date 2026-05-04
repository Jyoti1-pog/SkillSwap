import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { notificationsApi } from '../../services/api';
import useUIStore from '../../store/uiStore';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { timeAgo } from '../../utils/helpers';
import { clsx } from 'clsx';

const TYPE_META = {
  swap_request_received: { icon: '🔄', color: 'bg-brand-100 dark:bg-brand-950/50' },
  swap_request_accepted: { icon: '✅', color: 'bg-emerald-100 dark:bg-emerald-950/50' },
  swap_request_rejected: { icon: '❌', color: 'bg-red-100 dark:bg-red-950/50' },
  swap_request_cancelled: { icon: '🚫', color: 'bg-gray-100 dark:bg-gray-800' },
  session_scheduled: { icon: '📅', color: 'bg-blue-100 dark:bg-blue-950/50' },
  session_reminder: { icon: '⏰', color: 'bg-amber-100 dark:bg-amber-950/50' },
  session_completed: { icon: '🎉', color: 'bg-emerald-100 dark:bg-emerald-950/50' },
  new_message: { icon: '💬', color: 'bg-brand-100 dark:bg-brand-950/50' },
  review_received: { icon: '⭐', color: 'bg-amber-100 dark:bg-amber-950/50' },
  badge_earned: { icon: '🏅', color: 'bg-purple-100 dark:bg-purple-950/50' },
  profile_viewed: { icon: '👁️', color: 'bg-gray-100 dark:bg-gray-800' },
  match_found: { icon: '✨', color: 'bg-brand-100 dark:bg-brand-950/50' },
  admin_alert: { icon: 'ℹ️', color: 'bg-blue-100 dark:bg-blue-950/50' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifications } = useUIStore();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await notificationsApi.getNotifications({ limit: 50 });
        setNotifications(data.notifications || []);
        setUnreadNotifications(data.unreadCount || 0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAsRead([]);
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadNotifications(0);
  };

  const markRead = async (id) => {
    await notificationsApi.markAsRead([id]);
    setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id) => {
    await notificationsApi.deleteNotification(id);
    setNotifications((p) => p.filter((n) => n._id !== id));
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <BellIcon className="w-7 h-7 text-brand-500" />
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonList />
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {notifications.map((notif, i) => {
              const meta = TYPE_META[notif.type] || { icon: '🔔', color: 'bg-gray-100 dark:bg-gray-800' };
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  onClick={() => !notif.isRead && markRead(notif._id)}
                  className={clsx(
                    'relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200',
                    !notif.isRead
                      ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800/60 hover:bg-brand-100 dark:hover:bg-brand-950/30'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500" />
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl ${meta.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-semibold leading-snug', !notif.isRead ? 'text-brand-900 dark:text-brand-200' : 'text-gray-900 dark:text-white')}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(notif.createdAt)}</span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
