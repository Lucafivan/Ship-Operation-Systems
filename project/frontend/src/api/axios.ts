// src/api/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

// Interceptor ini akan otomatis menambahkan token ke SETIAP request
// yang menggunakan 'apiClient'
apiClient.interceptors.request.use(
  (config) => {
    // Kita gunakan "access_token" untuk konsistensi
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;