// API Client for FMS Customer Feedback & Critic Report Module

const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('fms_auth_token');
  const role = localStorage.getItem('fms_user_role') || 'ADMIN';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': role
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `Request failed with status ${response.status}` };
    }
    const error = new Error(errorData.message || errorData?.error?.message || 'Server error occurred');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Report Summary
  getSummary: () => request('/reports/summary'),

  // Feedback Data Grid
  getFeedbackList: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    try {
      return await request(`/reports/feedback?${query.toString()}`);
    } catch (e) {
      // Offline fallback using INITIAL_CUSTOMER_FEEDBACK
      const { INITIAL_CUSTOMER_FEEDBACK } = await import('../data/customerFeedbackData');
      let filtered = [...INITIAL_CUSTOMER_FEEDBACK];
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(f => 
          f.isbn.toLowerCase().includes(s) ||
          f.title.toLowerCase().includes(s) ||
          f.customer_name.toLowerCase().includes(s) ||
          f.feedback_number.toLowerCase().includes(s)
        );
      }
      if (params.feedbackType) {
        filtered = filtered.filter(f => f.feedback_type === params.feedbackType);
      }
      if (params.rating) {
        filtered = filtered.filter(f => String(f.rating) === String(params.rating));
      }
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);
      return {
        success: true,
        data: paged,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit) || 1
        }
      };
    }
  },

  // ISBN Deep-Dive & Timeline
  getIsbnReport: (isbn) => request(`/reports/feedback/isbn/${encodeURIComponent(isbn)}`),

  // Book Title Rollup Matrix
  getBookTitleReport: (query = '') => request(`/reports/feedback/book-titles?query=${encodeURIComponent(query)}`),

  // Positive Feedback Report
  getPositiveFeedback: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/reports/feedback/positive?${query.toString()}`);
  },

  // Negative / Critic Feedback Report
  getNegativeFeedback: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/reports/feedback/negative?${query.toString()}`);
  },

  // Top Appreciated Books (10)
  getTopAppreciated: (limit = 10) => request(`/reports/feedback/top-appreciated?limit=${limit}`),

  // Top Criticized Books (10)
  getTopCriticized: (limit = 10) => request(`/reports/feedback/top-criticized?limit=${limit}`),

  // Rating Analytics
  getRatingAnalytics: () => request('/reports/feedback/analytics/ratings'),

  // Feedback Trends (Daily, Weekly, Monthly, Quarterly, Yearly)
  getTrends: (interval = 'monthly', compare = true) => 
    request(`/reports/feedback/analytics/trends?interval=${interval}&compare=${compare}`),

  // Export URLs
  getExportUrl: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams({ format, ...filters });
    return `${API_BASE}/reports/feedback/export?${query.toString()}`;
  },

  // Public Customer Feedback Submission
  submitCustomerFeedback: (data) => request('/feedback/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

