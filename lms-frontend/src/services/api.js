import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// Course API
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getEnrolled: () => api.get('/courses/enrolled'),
  getByTeacher: () => api.get('/courses/teacher'),
};

// Assignment API
export const assignmentAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/assignments`),
  create: (courseId, formData) => api.post(`/courses/${courseId}/assignments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submit: (assignmentId, formData) =>
    api.post(`/assignments/${assignmentId}/submit`, formData),
  getSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
  grade: (submissionId, grade) => api.put(`/submissions/${submissionId}/grade`, { grade }),
  getStudentAssignments: () => api.get('/assignments/student'),
  getGradedAssignments: () => api.get('/assignments/student/graded'),
  getTeacherSubmissions: () => api.get('/assignments/teacher/submissions'),
};

// Material API
export const materialAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/materials`),
  upload: (courseId, formData) =>
    api.post(`/courses/${courseId}/materials`, formData),
  delete: (materialId) => api.delete(`/materials/${materialId}`),
};

// Attendance API
export const attendanceAPI = {
  getForDate: (courseId, date) => api.get(`/courses/${courseId}/attendance?date=${date}`),
  save: (courseId, date, data) => api.post(`/courses/${courseId}/attendance?date=${date}`, data),
  getMyAttendance: (courseId) => api.get(`/courses/${courseId}/attendance/me`),
};

// User API (Admin)
export const userAPI = {
  getAll: () => api.get('/admin/users'),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, userData) => api.put(`/admin/users/${id}`, userData),
  delete: (id) => api.delete(`/admin/users/${id}`),
  getDashboardStats: () => api.get('/admin/stats'),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
  uploadAvatar: (formData) =>
    api.post('/profile/avatar', formData),
};

export default api;
