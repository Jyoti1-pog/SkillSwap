import { clsx } from 'clsx';
import { getAvatarUrl, getInitials } from '../../utils/helpers';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
};

export default function Avatar({ user, size = 'md', className, online }) {
  const avatarUrl = getAvatarUrl(user);
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          className={clsx('avatar', sizes[size])}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div
        className={clsx(
          'avatar flex items-center justify-center font-bold text-white',
          'bg-gradient-to-br from-brand-500 to-accent-500',
          sizes[size],
          avatarUrl ? 'hidden' : 'flex'
        )}
      >
        {getInitials(user?.name)}
      </div>
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900',
            online ? 'bg-green-400' : 'bg-gray-300',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
          )}
        />
      )}
    </div>
  );
}
