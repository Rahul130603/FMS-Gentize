import apiClient from './client';

const BASE = '/technical-queries/reports';

export const reportApi = {
  dashboard: (params) => apiClient.get(`${BASE}/dashboard`, { params }).then((r) => r.data),
  employeeReport: (employeeId) => apiClient.get(`${BASE}/employee/${employeeId}`).then((r) => r.data),
  isbnReport: (isbn) => apiClient.get(`${BASE}/isbn`, { params: { isbn } }).then((r) => r.data),
  categoryAnalytics: (params) => apiClient.get(`${BASE}/category-analytics`, { params }).then((r) => r.data),
  resolutionPerformance: () => apiClient.get(`${BASE}/resolution-performance`).then((r) => r.data),
  trend: (params) => apiClient.get(`${BASE}/trend`, { params }).then((r) => r.data),
  pending: () => apiClient.get(`${BASE}/pending`).then((r) => r.data),
  reopened: () => apiClient.get(`${BASE}/reopened`).then((r) => r.data),

  // Exports require the Authorization header, so we fetch as a blob
  // (through the authenticated axios instance) rather than linking
  // directly to the URL.
  exportFiltered: async (format, params = {}) => {
    const res = await apiClient.get(`${BASE}/export`, { params: { ...params, format }, responseType: 'blob' });
    downloadBlob(res.data, `Technical_Query_Report_Filtered.${extFor(format)}`);
  },
  exportComplete: async (format) => {
    const res = await apiClient.get(`${BASE}/export/complete`, { params: { format }, responseType: 'blob' });
    downloadBlob(res.data, `Technical_Query_Report_Complete.${extFor(format)}`);
  },
  exportQuery: async (id, format, queryNumber) => {
    const res = await apiClient.get(`${BASE}/export/query/${id}`, { params: { format }, responseType: 'blob' });
    downloadBlob(res.data, `${queryNumber || id}.${extFor(format)}`);
  },
};

function extFor(format) {
  return format === 'excel' ? 'xlsx' : format;
}

function downloadBlob(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const searchApi = {
  search: (params) => apiClient.get('/technical-queries/search', { params }).then((r) => r.data),
};

export const metaApi = {
  lookups: () => apiClient.get('/technical-queries/meta/lookups').then((r) => r.data),
  employees: () => apiClient.get('/technical-queries/meta/employees').then((r) => r.data),
};
