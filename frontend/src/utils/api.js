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

// Course Materials API
export const getCourseMaterials = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);
  if (params.orderDirection) queryParams.append('orderDirection', params.orderDirection);
  
  const queryString = queryParams.toString();
  return api.get(`/api/course-materials${queryString ? `?${queryString}` : ''}`);
};

export const getCourseMaterial = (id) => api.get(`/api/course-materials/${id}`);

export const getCourseMaterialDownloadUrl = (id, expiresIn = 3600) => 
  api.get(`/api/course-materials/${id}/download?expiresIn=${expiresIn}`);

export const updateCourseMaterial = (id, data) => 
  api.put(`/api/course-materials/${id}`, data);

export const deleteCourseMaterial = (id) => 
  api.delete(`/api/course-materials/${id}`);

// File Upload API (for course materials)
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });
};

// Quiz API
export const getQuizzes = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);
  if (params.orderDirection) queryParams.append('orderDirection', params.orderDirection);
  
  const queryString = queryParams.toString();
  return api.get(`/api/quizzes${queryString ? `?${queryString}` : ''}`);
};

export const getQuiz = (id) => api.get(`/api/quizzes/${id}`);

export const createQuiz = (data) => api.post('/api/quizzes', data);

export const updateQuiz = (id, data) => api.put(`/api/quizzes/${id}`, data);

export const deleteQuiz = (id) => api.delete(`/api/quizzes/${id}`);

// Export the api instance for custom requests
export default api;
