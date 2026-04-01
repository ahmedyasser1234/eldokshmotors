import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  let token: string | null = null;

  // Method 1: Read from Zustand persist storage
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed?.state?.token ?? null;
    }
  } catch (_) {}

  // Method 2: Fallback - direct 'token' key
  if (!token) {
    token = localStorage.getItem('token');
  }

  // Check if token is expired before sending
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired - clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        window.location.href = '/admin/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch (_) {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
