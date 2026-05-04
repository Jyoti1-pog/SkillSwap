import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../services/api';

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const needsOnboarding = params.get('onboarding') === 'true';

    if (!token) {
      navigate('/auth/login?error=google_failed');
      return;
    }

    // Store token and fetch user
    setToken(token);
    authApi.getMe()
      .then(({ data }) => {
        setUser(data.user);
        navigate(needsOnboarding ? '/onboarding' : '/dashboard', { replace: true });
      })
      .catch(() => navigate('/auth/login?error=google_failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
