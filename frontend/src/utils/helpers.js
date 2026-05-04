import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date, fmt = 'MMM d, yyyy') => format(new Date(date), fmt);

export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy h:mm a');

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getAvatarUrl = (user) => {
  if (user?.avatar) return user.avatar;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`;
};

export const truncate = (str, len = 100) =>
  str && str.length > len ? `${str.slice(0, len)}...` : str;

export const levelColor = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  scheduled: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
};

export const matchScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-gray-500';
};

export const CATEGORY_ICONS = {
  Programming: '💻',
  Design: '🎨',
  Music: '🎵',
  Language: '🌍',
  Math: '📐',
  Science: '🔬',
  Business: '💼',
  Marketing: '📢',
  Writing: '✍️',
  Photography: '📷',
  Cooking: '🍳',
  Fitness: '💪',
  Art: '🎭',
  Finance: '💰',
  Sports: '⚽',
  Other: '✨',
};

export const apiError = (err) =>
  err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Something went wrong';
