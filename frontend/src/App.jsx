import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleSuccess from './pages/auth/GoogleSuccess';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import Discover from './pages/dashboard/Discover';
import Matches from './pages/dashboard/Matches';
import UserProfile from './pages/dashboard/UserProfile';
import Requests, { NewSwapRequest, RequestDetail } from './pages/dashboard/Requests';
import Messages from './pages/dashboard/Messages';
import Sessions, { NewSession } from './pages/dashboard/Sessions';
import Reviews, { NewReview } from './pages/dashboard/Reviews';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppInit() {
  const { fetchMe, token } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    fetchMe();
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#6171f5', secondary: 'white' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/auth/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* App routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile/me" element={<UserProfile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/new" element={<NewSwapRequest />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/new" element={<NewSession />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/new" element={<NewReview />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
