import axios from 'axios';
import { supabase } from './supabase.js';

// Get API base URL from environment variable
// In development, Vite proxy will handle /api requests
// In production, use VITE_API_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  async (config) => {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - sign out user
      await supabase.auth.signOut();
      // Redirect to login will be handled by ProtectedRoute component
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const healthCheck = () => api.get('/api/health');

// Export the api instance for custom requests
export default api;
