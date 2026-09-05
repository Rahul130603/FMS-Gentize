import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fms_token');
      localStorage.removeItem('fms_user');
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export function downloadExport(path: string, params: Record<string, any>, filename: string) {
  const token = localStorage.getItem('fms_token');
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as any).toString();
  fetch(`/api/export/${path}?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
}
