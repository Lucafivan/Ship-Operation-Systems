import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

// Interceptor ini akan otomatis menambahkan token ke setiap request yang menggunakan 'apiClient'
apiClient.interceptors.request.use(
  (config) => {
    // Gunakan "access_token" untuk konsistensi
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

// Handle 401s for this client by refreshing token then retrying once
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(
          '/auth/refresh',
          null,
          {
            baseURL: apiClient.defaults.baseURL,
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );
        const newAccess = res.data?.access_token;
        if (newAccess) {
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return apiClient.request(originalRequest);
        }
      } catch (e) {
        // fall through to reject
      }
    }
    return Promise.reject(error);
  }
);