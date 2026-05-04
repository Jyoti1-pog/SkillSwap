import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const usersApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  getMyProfile: () => api.get('/users/me/profile'),
  updateProfile: (data) => api.put('/users/me', data),
  completeOnboarding: (data) => api.post('/users/me/onboarding', data),
  getMyStats: () => api.get('/users/me/stats'),
  searchUsers: (params) => api.get('/users/search', { params }),
  deleteAccount: () => api.delete('/users/me'),
};

export const matchesApi = {
  getMatches: (params) => api.get('/matches', { params }),
};

export const requestsApi = {
  getRequests: (params) => api.get('/requests', { params }),
  getRequest: (id) => api.get(`/requests/${id}`),
  sendRequest: (data) => api.post('/requests', data),
  acceptRequest: (id) => api.patch(`/requests/${id}/accept`),
  rejectRequest: (id, reason) => api.patch(`/requests/${id}/reject`, { reason }),
  cancelRequest: (id, reason) => api.patch(`/requests/${id}/cancel`, { reason }),
};

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (convId, params) => api.get(`/messages/conversations/${convId}`, { params }),
  sendMessage: (convId, data) => api.post(`/messages/conversations/${convId}`, data),
  createConversation: (participantId) => api.post('/messages/conversations', { participantId }),
};

export const sessionsApi = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSession: (id) => api.get(`/sessions/${id}`),
  scheduleSession: (data) => api.post('/sessions', data),
  updateStatus: (id, data) => api.patch(`/sessions/${id}/status`, data),
  cancelSession: (id) => api.patch(`/sessions/${id}/cancel`),
};

export const reviewsApi = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
};

export const notificationsApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (ids) => api.patch('/notifications/read', { ids }),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const skillsApi = {
  getCategories: () => api.get('/skills/categories'),
  getPopular: () => api.get('/skills/popular'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.patch(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.patch(`/admin/users/${id}/unban`),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}/resolve`, data),
  hideReview: (id) => api.patch(`/admin/reviews/${id}/hide`),
};

export const uploadApi = {
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/upload/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
