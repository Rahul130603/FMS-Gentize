import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

// Mock technical queries dataset
export const INITIAL_TECHNICAL_QUERIES = [
  {
    id: 1,
    query_number: 'TQ-2026-001',
    subject: 'ISBN Metadata mismatch on Springer book export',
    description: 'The ISBN registered on production batch 404 does not match the ONIX 3.0 metadata catalog record. EPUB validation is throwing a fatal schema warning.',
    isbn: '9781234567890',
    category: 'isbn_mismatch',
    priority: 'urgent',
    status: 'in_progress',
    created_by_name: 'Priya S.',
    assigned_to_name: 'Rahul R.',
    created_at: '2026-09-04T09:30:00Z',
    updated_at: '2026-09-05T11:15:00Z',
    resolved_at: null,
    attachment_count: 2,
    attachments: [
      { id: 1, name: 'onix_error_log.txt', size: 14200 },
      { id: 2, name: 'epub_preflight_dump.pdf', size: 245000 }
    ],
    timeline: [
      { id: 1, action: 'Query raised', user: 'Priya S.', timestamp: '2026-09-04T09:30:00Z' },
      { id: 2, action: 'Assigned to Rahul R.', user: 'System', timestamp: '2026-09-04T09:35:00Z' },
      { id: 3, action: 'Status changed to In Progress', user: 'Rahul R.', timestamp: '2026-09-04T10:00:00Z' }
    ],
    comments: [
      { id: 1, user_name: 'Rahul R.', comment: 'Investigating the ONIX feed transformer rule for prefix 97812.', created_at: '2026-09-04T10:05:00Z' }
    ]
  },
  {
    id: 2,
    query_number: 'TQ-2026-002',
    subject: 'Missing high-res cover plates in delivery zip',
    description: 'Archive delivered to client missing CMYK 300 DPI spine jacket image.',
    isbn: '9780132350884',
    category: 'missing_file',
    priority: 'high',
    status: 'open',
    created_by_name: 'Manoj K.',
    assigned_to_name: null,
    created_at: '2026-09-04T14:20:00Z',
    updated_at: '2026-09-04T14:20:00Z',
    resolved_at: null,
    attachment_count: 1,
    attachments: [{ id: 3, name: 'manifest.json', size: 4200 }],
    timeline: [
      { id: 4, action: 'Query raised', user: 'Manoj K.', timestamp: '2026-09-04T14:20:00Z' }
    ],
    comments: []
  },
  {
    id: 3,
    query_number: 'TQ-2026-003',
    subject: 'MathML symbols clipping in WebKit EPUB renderer',
    description: 'Integral formulas in chapter 7 exceed baseline bounds on mobile screens.',
    isbn: '9780262033848',
    category: 'software_bug',
    priority: 'high',
    status: 'resolved',
    created_by_name: 'Sudhin P.',
    assigned_to_name: 'Arun K.',
    created_at: '2026-09-02T08:00:00Z',
    updated_at: '2026-09-03T16:00:00Z',
    resolved_at: '2026-09-03T16:00:00Z',
    attachment_count: 0,
    attachments: [],
    timeline: [
      { id: 5, action: 'Query raised', user: 'Sudhin P.', timestamp: '2026-09-02T08:00:00Z' },
      { id: 6, action: 'Resolved by patch v2.4.1', user: 'Arun K.', timestamp: '2026-09-03T16:00:00Z' }
    ],
    comments: [
      { id: 2, user_name: 'Arun K.', comment: 'Applied viewBox normalization to all SVG MathML equations.', created_at: '2026-09-03T15:55:00Z' }
    ]
  },
  {
    id: 4,
    query_number: 'TQ-2026-004',
    subject: 'FTP Server connection timeout during mass PDF sync',
    description: 'Timeout occurs when transferring batches exceeding 500MB to European distributor mirrors.',
    isbn: null,
    category: 'server_issue',
    priority: 'urgent',
    status: 'closed',
    created_by_name: 'Claire D.',
    assigned_to_name: 'DevOps Lead',
    created_at: '2026-08-28T11:00:00Z',
    updated_at: '2026-08-29T17:30:00Z',
    resolved_at: '2026-08-29T17:30:00Z',
    attachment_count: 1,
    attachments: [{ id: 4, name: 'ftp_timeout.log', size: 8400 }],
    timeline: [
      { id: 7, action: 'Query raised', user: 'Claire D.', timestamp: '2026-08-28T11:00:00Z' },
      { id: 8, action: 'Closed and verified', user: 'DevOps Lead', timestamp: '2026-08-29T17:30:00Z' }
    ],
    comments: []
  },
  {
    id: 5,
    query_number: 'TQ-2026-005',
    subject: 'Accessibility contrast report false positive on code blocks',
    description: 'Axe-core checker flagged dark mode monospace blocks incorrectly.',
    isbn: '9780596517748',
    category: 'software_bug',
    priority: 'normal',
    status: 'reopened',
    created_by_name: 'Priya S.',
    assigned_to_name: 'Arun K.',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-04T12:00:00Z',
    resolved_at: null,
    attachment_count: 0,
    attachments: [],
    timeline: [
      { id: 9, action: 'Query reopened by Priya S.', user: 'Priya S.', timestamp: '2026-09-04T12:00:00Z' }
    ],
    comments: [
      { id: 3, user_name: 'Priya S.', comment: 'Still reproducing on Safari 17 iOS preview.', created_at: '2026-09-04T12:01:00Z' }
    ]
  }
];

let queryStore = [...INITIAL_TECHNICAL_QUERIES];

export const technicalQueryApi = {
  myDashboard: async () => {
    try {
      const res = await client.get('/technical-queries/dashboard/my');
      return res.data;
    } catch (e) {
      return {
        data: {
          total_queries: queryStore.length,
          open_count: queryStore.filter((q) => q.status === 'open').length,
          resolved_count: queryStore.filter((q) => q.status === 'resolved').length,
          closed_count: queryStore.filter((q) => q.status === 'closed').length,
          pending_count: queryStore.filter((q) => q.status === 'open' || q.status === 'in_progress').length,
          urgent_count: queryStore.filter((q) => q.priority === 'urgent').length,
          reopened_count: queryStore.filter((q) => q.status === 'reopened').length,
          avg_resolution_hours: 18.5
        }
      };
    }
  },

  list: async (params = {}) => {
    try {
      const res = await client.get('/technical-queries', { params });
      return res.data;
    } catch (e) {
      let filtered = [...queryStore];
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (q) =>
            q.subject.toLowerCase().includes(s) ||
            q.query_number.toLowerCase().includes(s) ||
            (q.isbn && q.isbn.includes(s))
        );
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((q) => q.status === params.status);
      }
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((q) => q.category === params.category);
      }
      if (params.priority && params.priority !== 'all') {
        filtered = filtered.filter((q) => q.priority === params.priority);
      }
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        meta: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit) || 1
        }
      };
    }
  },

  get: async (id) => {
    try {
      const res = await client.get(`/technical-queries/${id}`);
      return res.data;
    } catch (e) {
      const q = queryStore.find((item) => String(item.id) === String(id) || item.query_number === id) || queryStore[0];
      return { data: q };
    }
  },

  create: async (formData) => {
    try {
      const res = await client.post('/technical-queries', formData);
      return res.data;
    } catch (e) {
      const subject = formData.get ? formData.get('subject') : formData.subject;
      const desc = formData.get ? formData.get('description') : formData.description;
      const cat = formData.get ? formData.get('category') : formData.category;
      const priority = formData.get ? formData.get('priority') : formData.priority;
      const isbn = formData.get ? formData.get('isbn') : formData.isbn;
      const newQuery = {
        id: Date.now(),
        query_number: `TQ-2026-${Math.floor(100 + Math.random() * 900)}`,
        subject: subject || 'New Technical Query',
        description: desc || '',
        isbn: isbn || null,
        category: cat || 'other',
        priority: priority || 'normal',
        status: 'open',
        created_by_name: 'Current User',
        assigned_to_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        attachment_count: 0,
        attachments: [],
        timeline: [{ id: Date.now(), action: 'Query raised', user: 'Current User', timestamp: new Date().toISOString() }],
        comments: []
      };
      queryStore.unshift(newQuery);
      return { data: newQuery };
    }
  },

  addComment: async (id, commentText) => {
    const q = queryStore.find((item) => String(item.id) === String(id));
    if (q) {
      const comment = {
        id: Date.now(),
        user_name: 'Current User',
        comment: commentText,
        created_at: new Date().toISOString()
      };
      q.comments.push(comment);
      return { data: comment };
    }
    return { data: {} };
  },

  updateStatus: async (id, newStatus) => {
    const q = queryStore.find((item) => String(item.id) === String(id));
    if (q) {
      q.status = newStatus;
      q.updated_at = new Date().toISOString();
      q.timeline.push({
        id: Date.now(),
        action: `Status changed to ${newStatus}`,
        user: 'Current User',
        timestamp: new Date().toISOString()
      });
      return { data: q };
    }
    return { data: {} };
  },

  isbnHistory: async (isbn) => {
    try {
      const res = await client.get(`/technical-queries/isbn/${isbn}`);
      return res.data;
    } catch (e) {
      const matches = queryStore.filter((q) => q.isbn === isbn);
      return { data: matches };
    }
  }
};

export const reportApi = {
  dashboard: async () => {
    try {
      const res = await client.get('/reports/technical-queries/dashboard');
      return res.data;
    } catch (e) {
      return {
        data: {
          total_queries: queryStore.length,
          open_count: queryStore.filter((q) => q.status === 'open').length,
          resolved_count: queryStore.filter((q) => q.status === 'resolved').length,
          closed_count: queryStore.filter((q) => q.status === 'closed').length,
          urgent_count: queryStore.filter((q) => q.priority === 'urgent').length,
          high_count: queryStore.filter((q) => q.priority === 'high').length,
          pending_count: queryStore.filter((q) => q.status === 'open' || q.status === 'in_progress').length,
          reopened_count: queryStore.filter((q) => q.status === 'reopened').length,
          avg_resolution_hours: 18.5
        }
      };
    }
  },

  categoryAnalytics: async () => {
    const catCounts = {};
    queryStore.forEach((q) => {
      catCounts[q.category] = (catCounts[q.category] || 0) + 1;
    });
    const total = queryStore.length || 1;
    return {
      data: Object.entries(catCounts).map(([cat, count]) => ({
        category: cat,
        count,
        percentage: Number(((count / total) * 100).toFixed(1))
      }))
    };
  },

  trendReport: async () => {
    return {
      data: [
        { date: '01 Sep', raised: 4, resolved: 3 },
        { date: '02 Sep', raised: 6, resolved: 5 },
        { date: '03 Sep', raised: 5, resolved: 6 },
        { date: '04 Sep', raised: 7, resolved: 4 },
        { date: '05 Sep', raised: 3, resolved: 2 }
      ]
    };
  }
};

export const notificationApi = {
  list: async () => ({
    data: [
      { id: 1, query_id: 1, message: 'Your query TQ-2026-001 has been assigned to Rahul R.', is_read: false, created_at: '2026-09-04T09:35:00Z' },
      { id: 2, query_id: 3, message: 'Your query TQ-2026-003 was marked as Resolved.', is_read: true, created_at: '2026-09-03T16:00:00Z' }
    ]
  }),
  markRead: async (id) => ({ success: true })
};
