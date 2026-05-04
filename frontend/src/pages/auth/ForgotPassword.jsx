import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { apiError } from '../../utils/helpers';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent (check console in dev mode)');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-gradient">SkillSwap Quest</span>
        </Link>

        {sent ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-muted text-sm mb-6">We sent a password reset link to your email address.</p>
            <Link to="/auth/login" className="btn-primary inline-block">Back to sign in</Link>
          </div>
        ) : (
          <div className="card">
            <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
            <p className="text-muted text-sm mb-6">Enter your email address and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/auth/login" className="text-sm text-brand-600 hover:text-brand-700">← Back to sign in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
