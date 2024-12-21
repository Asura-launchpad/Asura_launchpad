import { getCsrfToken, setCsrfToken } from '@/utils/csrfToken';
import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://overdive.xyz/';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = getCsrfToken();
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});


api.interceptors.response.use(
  (response) => {
    const csrfToken = response.headers['x-csrftoken'];
    if (csrfToken) {
      setCsrfToken(csrfToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Use refresh token to request new access token
        const response = await api.post('/auth/refresh-token');
        const newAccessToken = response.data.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is also expired or invalid
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;