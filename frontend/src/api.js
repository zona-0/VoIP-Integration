import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Auto-attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('caas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout jika token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('caas_token');
      localStorage.removeItem('caas_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
