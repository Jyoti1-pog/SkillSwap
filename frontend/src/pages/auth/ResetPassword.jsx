import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { apiError } from '../../utils/helpers';
import { useState } from 'react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { token: params.get('token') || '' },
  });

  const onSubmit = async ({ token, password }) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successfully!');
      navigate('/auth/login');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md card">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-gradient">SkillSwap Quest</span>
        </Link>
        <h1 className="text-2xl font-bold mb-2">Set new password</h1>
        <p className="text-muted text-sm mb-6">Enter your reset token and new password.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Reset token"
            placeholder="Paste token from email"
            error={errors.token?.message}
            {...register('token', { required: 'Token is required' })}
          />
          <Input
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register('password', { required: true, minLength: { value: 8, message: 'At least 8 characters' } })}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { validate: (v) => v === watch('password') || 'Passwords do not match' })}
          />
          <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/auth/login" className="text-sm text-brand-600 hover:text-brand-700">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
