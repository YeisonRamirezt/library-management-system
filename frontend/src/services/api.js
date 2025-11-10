import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// Books API calls
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getById: (id) => api.get(`/books/${id}`).then(response => response.data),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  getRatings: (bookId) => api.get(`/books/${bookId}/ratings`),
  rate: (bookId, ratingData) => api.post(`/books/${bookId}/rate`, ratingData),
};

// Users API calls
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getBorrowings: (userId) => api.get(`/users/${userId}/borrowings`),
};

// Borrowing API calls
export const borrowingAPI = {
  borrow: (userId, bookId) => api.post(`/users/${userId}/borrow`, { book_id: bookId }),
  return: (borrowingId) => api.post(`/borrowings/${borrowingId}/return`),
  getActive: () => api.get('/borrowings/active'),
  getStatistics: () => api.get('/borrowings/statistics'),
  getUserBorrowings: () => api.get('/my-borrowings'),
};

// Dashboard API calls
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getUserStats: () => api.get('/dashboard/user'),
};

// Authors API calls
export const authorsAPI = {
  getAll: (params) => api.get('/authors', { params }),
  getById: (id) => api.get(`/authors/${id}`),
  create: (authorData) => api.post('/authors', authorData),
  update: (id, authorData) => api.put(`/authors/${id}`, authorData),
  delete: (id) => api.delete(`/authors/${id}`),
};

// Ratings API calls
export const ratingsAPI = {
  getUserRatings: () => api.get('/ratings/my-ratings'),
  update: (ratingId, ratingData) => api.put(`/ratings/${ratingId}`, ratingData),
  delete: (ratingId) => api.delete(`/ratings/${ratingId}`),
};

export default api;