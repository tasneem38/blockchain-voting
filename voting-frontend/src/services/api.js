import axios from 'axios';

let authContextRef = null;

export function setAuthContext(ctx) {
  authContextRef = ctx;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authContextRef?.token) {
    config.headers.Authorization = `Bearer ${authContextRef.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && authContextRef?.isAuthenticated) {
      authContextRef.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
