import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        useAuthStore.getState().logout();
        window.location.href = '/login';
      } catch (err) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      alert('Access Denied: You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      alert('Server Error: Something went wrong on the backend.');
    }
    return Promise.reject(error);
  }
);

export default api;
