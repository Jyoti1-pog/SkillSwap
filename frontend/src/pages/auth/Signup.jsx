import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import useAuthStore from '../../store/authStore';
import { apiError } from '../../utils/helpers';

const PERKS = [
  { icon: '🎯', title: 'Smart Matching', desc: 'AI pairs you with the perfect swap partner' },
  { icon: '🔐', title: 'Verified Profiles', desc: 'All users are real and authenticated' },
  { icon: '⭐', title: 'Review System', desc: 'Build reputation through honest feedback' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Coordinate sessions instantly' },
];

const AVATAR_COLORS = ['bg-brand-500', 'bg-accent-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
const FACES = ['JD', 'AM', 'KL', 'TP', 'SR'];

export default function Signup() {
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password', '');

  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-amber-500' },
      { level: 3, label: 'Good', color: 'bg-yellow-400' },
      { level: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return map[score - 1] || { level: 0, label: '', color: '' };
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    try {
      await signup({ name: data.name, email: data.email, password: data.password, referralCode: data.referralCode });
      toast.success("Account created! Let's set up your profile.");
      navigate('/onboarding', { replace: true });
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex w-[48%] relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(145deg, #701a75 0%, #a21caf 30%, #6366f1 65%, #4338ca 100%)' }}>

        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative z-10 max-w-sm w-full">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">SkillSwap</span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Teach what<br />
            <span className="text-white/70">you know.</span><br />
            Learn the rest.
          </h2>
          <p className="text-white/70 text-base mb-10 leading-relaxed">
            Join a community where every skill has value. No money changes hands — only knowledge.
          </p>

          {/* Social proof avatars */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex -space-x-2">
              {FACES.map((f, i) => (
                <div key={f} className={`w-9 h-9 rounded-full ${AVATAR_COLORS[i]} border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold`}>
                  {f}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">12,400+ members</div>
              <div className="text-white/55 text-xs">and growing every day</div>
            </div>
          </div>

          {/* Perks list */}
          <div className="grid grid-cols-1 gap-3">
            {PERKS.map((p) => (
              <div key={p.title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{p.title}</div>
                  <div className="text-white/55 text-xs">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-md py-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gradient">SkillSwap</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full name */}
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.level ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Password strength: <span className="font-medium">{strength.label}</span></p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Referral code */}
            <div>
              <label className="label">
                Referral code
                <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ALEX1234"
                className="input"
                {...register('referralCode')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full py-3 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or sign up with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => { window.location.href = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}/api/auth/google`; }}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
            By signing up, you agree to our{' '}
            <span className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
            <Link to="/auth/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
