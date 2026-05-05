import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import { apiError } from '../../utils/helpers';

const REVIEWS = [
  { name: 'Sofia R.', role: 'Taught Python · Learned Guitar', avatar: 'SR', rating: 5, text: 'Found my perfect swap partner in 2 days. This platform is magic!' },
  { name: 'Marcus T.', role: 'Taught React · Learned Spanish', avatar: 'MT', rating: 5, text: 'Exchanged React skills for Spanish lessons. Best trade ever.' },
  { name: 'Yuki N.', role: 'Taught Design · Learned ML', avatar: 'YN', rating: 5, text: 'The matching algorithm is incredibly accurate. Love it!' },
];

const FLOATING_SKILLS = [
  { label: 'JavaScript', x: '10%', y: '20%', delay: 0 },
  { label: 'Design', x: '75%', y: '15%', delay: 0.5 },
  { label: 'Python', x: '15%', y: '65%', delay: 1 },
  { label: 'Piano', x: '70%', y: '70%', delay: 1.5 },
  { label: 'Spanish', x: '45%', y: '85%', delay: 0.8 },
];

const STATS = [
  { value: '12K+', label: 'Active learners' },
  { value: '95%', label: 'Match rate' },
  { value: '4.9★', label: 'Avg rating' },
];

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`);
      navigate(result.user.onboardingCompleted ? from : '/onboarding', { replace: true });
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #a21caf 80%, #d946ef 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-10" />

        {/* Soft blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-2xl" />

        {/* Floating skill chips */}
        {FLOATING_SKILLS.map((s) => (
          <motion.div
            key={s.label}
            className="absolute hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium"
            style={{ left: s.x, top: s.y }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-300" />
            {s.label}
          </motion.div>
        ))}

        {/* Main panel content */}
        <div className="relative z-10 max-w-sm w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">SkillSwap</span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Every skill<br />
            <span className="text-white/70">is worth</span><br />
            something.
          </h2>
          <p className="text-white/70 text-base mb-10 leading-relaxed">
            Trade what you know for what you want to learn. No money needed.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-1 text-yellow-300 mb-3 text-sm">
                  {'★'.repeat(REVIEWS[reviewIdx].rating)}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  "{REVIEWS[reviewIdx].text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs">
                    {REVIEWS[reviewIdx].avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{REVIEWS[reviewIdx].name}</div>
                    <div className="text-white/55 text-xs">{REVIEWS[reviewIdx].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-4">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === reviewIdx ? 'bg-white w-6' : 'bg-white/30 w-3'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
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
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to continue your skill exchange journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
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
                  Signing in…
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => { window.location.href = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '').replace(/\/api$/, '')}/api/auth/google`; }}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
            <Link to="/auth/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">
              Create one free
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Demo credentials</span>
            </div>
            <div className="space-y-1 text-xs text-brand-600 dark:text-brand-400 font-mono">
              <p>User: alex@seed.skillswap.com / Password123!</p>
              <p>Admin: admin@skillswap.com / Admin123!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
