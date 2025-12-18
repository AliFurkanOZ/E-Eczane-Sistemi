import axios from 'axios';
import { API_URL } from '../utils/constants';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[DEBUG] API Request:', config.url);
    console.log('[DEBUG] Token exists:', !!token);
    console.log('[DEBUG] Token value:', token ? token.substring(0, 20) + '...' : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized - Token geçersiz
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        // Don't redirect here - let the React Router handle it
        // window.location.href = '/login';
      }

      // 403 Forbidden - Yetki yok
      if (error.response.status === 403) {
        console.error('Bu işlem için yetkiniz yok');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
