import axios, { AxiosInstance } from 'axios';

// Constants
const BASE_API_URL = import.meta.env.VITE_API_URL ?? 'https://trip.shiningerp.com';
const AUTH_TOKEN_KEY = 'token';
const SESSION_ID_KEY = 'session_id';

/**
 * USER API INSTANCE
 */
export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_API_URL}/api`,
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
});

// User Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// User Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPath = ['/login', '/register', '/forgot-password', '/reset-password'].some(path => 
        currentPath.includes(path)
      );
      
      if (!isAuthPath) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(SESSION_ID_KEY);
        alert('You have been logged out because someone else logged into your account.');
        window.location.replace('/login');
      }
    }

    if (status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Keep standard export as default for the user API to avoid breaking existing imports
export default api;
