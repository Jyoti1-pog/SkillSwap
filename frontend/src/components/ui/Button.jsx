import { clsx } from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 font-semibold px-5 py-2.5 rounded-xl transition-all',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-lg px-6 py-3',
};

export default function Button({ variant = 'primary', size = 'md', className, children, loading, ...props }) {
  return (
    <button
      className={clsx(variants[variant], sizes[size], className, 'inline-flex items-center justify-center gap-2')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
