import axios from 'axios';
import { supabase } from './supabase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
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

// Course API functions
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourse = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (data) => {
  const response = await api.post('/courses', data);
  return response.data;
};

export const updateCourse = async (id, data) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

// Course Materials API functions
export const getCourseMaterials = async (courseId = null) => {
  const params = courseId ? { course_id: courseId } : {};
  const response = await api.get('/course-materials', { params });
  return response.data;
};

export const getCourseMaterial = async (id) => {
  const response = await api.get(`/course-materials/${id}`);
  return response.data;
};

export const uploadCourseMaterial = async (file, courseId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (courseId) {
    formData.append('course_id', courseId);
  }
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCourseMaterial = async (id) => {
  const response = await api.delete(`/course-materials/${id}`);
  return response.data;
};

// Quiz API functions
export const getQuizzes = async (courseId = null) => {
  const params = courseId ? { course_id: courseId } : {};
  const response = await api.get('/quizzes', { params });
  return response.data;
};

export const getQuiz = async (id) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (data) => {
  const response = await api.post('/quizzes', data);
  return response.data;
};

export const updateQuiz = async (id, data) => {
  const response = await api.put(`/quizzes/${id}`, data);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export default api;

