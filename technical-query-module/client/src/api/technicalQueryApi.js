import apiClient from './client';

const BASE = '/technical-queries';

export const technicalQueryApi = {
  list: (params) => apiClient.get(BASE, { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`${BASE}/${id}`).then((r) => r.data),
  isbnHistory: (isbn, excludeId) =>
    apiClient.get(`${BASE}/isbn-history`, { params: { isbn, excludeId } }).then((r) => r.data),
  myDashboard: () => apiClient.get(`${BASE}/my-dashboard`).then((r) => r.data),
  create: (formData) =>
    apiClient.post(BASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  assign: (id, payload) => apiClient.patch(`${BASE}/${id}/assign`, payload).then((r) => r.data),
  changePriority: (id, payload) => apiClient.patch(`${BASE}/${id}/priority`, payload).then((r) => r.data),
  changeStatus: (id, payload) => apiClient.patch(`${BASE}/${id}/status`, payload).then((r) => r.data),
  updateAdminNotes: (id, payload) => apiClient.patch(`${BASE}/${id}/admin-notes`, payload).then((r) => r.data),
  requestInfo: (id, payload) => apiClient.post(`${BASE}/${id}/request-info`, payload).then((r) => r.data),
  resolve: (id, payload) => apiClient.post(`${BASE}/${id}/resolve`, payload).then((r) => r.data),
  close: (id) => apiClient.post(`${BASE}/${id}/close`).then((r) => r.data),
  reopen: (id, payload) => apiClient.post(`${BASE}/${id}/reopen`, payload).then((r) => r.data),
  archive: (id) => apiClient.post(`${BASE}/${id}/archive`).then((r) => r.data),

  listComments: (id) => apiClient.get(`${BASE}/${id}/comments`).then((r) => r.data),
  addComment: (id, payload) => apiClient.post(`${BASE}/${id}/comments`, payload).then((r) => r.data),

  uploadAttachments: (id, formData) =>
    apiClient.post(`${BASE}/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  // Downloads require the Authorization header, so a plain <a href> won't
  // work — fetch as a blob (carrying the auth interceptor) and trigger a
  // save via a throwaway object URL instead.
  downloadAttachment: async (id, attachmentId, filename) => {
    const res = await apiClient.get(`${BASE}/${id}/attachments/${attachmentId}/download`, { responseType: 'blob' });
    triggerBlobDownload(res.data, filename || `attachment-${attachmentId}`);
  },
  downloadAllAttachments: async (id, queryNumber) => {
    const res = await apiClient.get(`${BASE}/${id}/attachments/download-all`, { responseType: 'blob' });
    triggerBlobDownload(res.data, `${queryNumber || id}-attachments.zip`);
  },
};

function triggerBlobDownload(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
