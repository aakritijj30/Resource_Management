import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Route through Vite proxy
});

console.log('DEBUG: Axios Instance Created with baseURL:', api.defaults.baseURL);

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;