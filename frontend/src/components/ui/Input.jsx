import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, hint, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input
      ref={ref}
      className={clsx('input', error && 'border-red-400 focus:ring-red-400', className)}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    {hint && !error && <p className="mt-1 text-sm text-gray-400">{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
