import { clsx } from 'clsx';

const variants = {
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  accent: 'bg-accent-100 text-accent-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function Badge({ variant = 'default', className, children, dot }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-brand-500': variant === 'primary',
        'bg-green-500': variant === 'success',
        'bg-yellow-500': variant === 'warning',
        'bg-red-500': variant === 'danger',
      })} />}
      {children}
    </span>
  );
}
