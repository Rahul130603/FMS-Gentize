import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('tqm-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem('tqm-token');
      window.localStorage.removeItem('tqm-user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
