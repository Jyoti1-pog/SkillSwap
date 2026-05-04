import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <Spinner />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  if (isInitializing) return <Spinner />;
  if (isAuthenticated) {
    return <Navigate to={user?.onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }
  return children;
}
