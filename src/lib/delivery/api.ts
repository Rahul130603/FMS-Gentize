import axios from 'axios';
import { Project, UserOption } from './types';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rich mock data for offline resilience
export const MOCK_USERS: UserOption[] = [
  { id: 1, name: 'Alice Admin', email: 'alice@pubflow.com', role: 'Admin', department: 'Management' },
  { id: 2, name: 'Maya Manager', email: 'maya@pubflow.com', role: 'Manager', department: 'EPUB' },
  { id: 3, name: 'Ravi Rao', email: 'ravi@pubflow.com', role: 'Manager', department: 'POD' },
  { id: 4, name: 'Pradhap Kumar', email: 'pradhap.k@pubflow.com', role: 'Admin', department: 'Digital Publishing' },
  { id: 5, name: 'Priya Patel', email: 'priya@pubflow.com', role: 'Employee', department: 'Scanning' },
  { id: 6, name: 'John Employee', email: 'john@pubflow.com', role: 'Employee', department: 'EPUB' },
  { id: 7, name: 'Sam Lee', email: 'sam@pubflow.com', role: 'Employee', department: 'POD' },
  { id: 8, name: 'Dana Cruz', email: 'dana@pubflow.com', role: 'Employee', department: 'Cover Design' },
  { id: 9, name: 'Omar Khan', email: 'omar@pubflow.com', role: 'Employee', department: 'QC' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 101,
    project_number: 'PRJ-2026-001',
    isbn: '9781234567890',
    book_title: 'Advanced File Processing Workflows',
    client_name: 'Apex Publishing Group',
    project_type: 'EPUB',
    department: 'EPUB',
    assigned_to: 6,
    assignedEmployee: { id: 6, name: 'John Employee' },
    manager: 2,
    managerUser: { id: 2, name: 'Maya Manager' },
    priority: 'High',
    status: 'In Progress',
    current_stage: 'EPDF',
    completion_percentage: 65,
    due_date: '2026-09-12',
    actual_delivery_date: undefined,
    health_score: 88,
    health_category: 'Good',
    health_risk: 'Low',
    days_remaining: 5,
    due_label: 'Due in 5 days',
    due_color: 'green'
  },
  {
    id: 102,
    project_number: 'PRJ-2026-002',
    isbn: '9780132350884',
    book_title: 'Clean Code: A Handbook of Agile Software',
    client_name: 'Vance Academic Press',
    project_type: 'POD',
    department: 'POD',
    assigned_to: 7,
    assignedEmployee: { id: 7, name: 'Sam Lee' },
    manager: 3,
    managerUser: { id: 3, name: 'Ravi Rao' },
    priority: 'Critical',
    status: 'Ready for Delivery',
    current_stage: 'Ready for Delivery',
    completion_percentage: 95,
    due_date: '2026-09-08',
    actual_delivery_date: undefined,
    health_score: 94,
    health_category: 'Excellent',
    health_risk: 'None',
    days_remaining: 1,
    due_label: 'Due tomorrow',
    due_color: 'amber'
  },
  {
    id: 103,
    project_number: 'PRJ-2026-003',
    isbn: '9780201616224',
    book_title: 'The Pragmatic Programmer: 20th Anniversary',
    client_name: 'Nordic Book Services',
    project_type: 'Scanning',
    department: 'Scanning',
    assigned_to: 5,
    assignedEmployee: { id: 5, name: 'Priya Patel' },
    manager: 2,
    managerUser: { id: 2, name: 'Maya Manager' },
    priority: 'Normal',
    status: 'Completed',
    current_stage: 'Delivered',
    completion_percentage: 100,
    due_date: '2026-09-04',
    actual_delivery_date: '2026-09-03',
    health_score: 99,
    health_category: 'Delivered',
    health_risk: 'None',
    days_remaining: 0,
    due_label: 'Delivered On-Time',
    due_color: 'green'
  },
  {
    id: 104,
    project_number: 'PRJ-2026-004',
    isbn: '9780596517748',
    book_title: 'JavaScript: The Good Parts',
    client_name: 'Pacific Tech Media',
    project_type: 'Cover Design',
    department: 'Cover Design',
    assigned_to: 8,
    assignedEmployee: { id: 8, name: 'Dana Cruz' },
    manager: 3,
    managerUser: { id: 3, name: 'Ravi Rao' },
    priority: 'High',
    status: 'QC',
    current_stage: 'QC',
    completion_percentage: 80,
    due_date: '2026-09-06',
    actual_delivery_date: undefined,
    health_score: 62,
    health_category: 'Attention',
    health_risk: 'Medium',
    days_remaining: -1,
    due_label: 'Overdue by 1 day',
    due_color: 'red'
  },
  {
    id: 105,
    project_number: 'PRJ-2026-005',
    isbn: '9781449331818',
    book_title: 'Learning JavaScript Design Patterns',
    client_name: 'Berlin University Press',
    project_type: 'QAG',
    department: 'QAG',
    assigned_to: 9,
    assignedEmployee: { id: 9, name: 'Omar Khan' },
    manager: 2,
    managerUser: { id: 2, name: 'Maya Manager' },
    priority: 'Normal',
    status: 'In Progress',
    current_stage: 'Scanning',
    completion_percentage: 30,
    due_date: '2026-09-20',
    actual_delivery_date: undefined,
    health_score: 75,
    health_category: 'Fair',
    health_risk: 'Low',
    days_remaining: 13,
    due_label: 'Due in 13 days',
    due_color: 'green'
  }
];

let localProjects = [...MOCK_PROJECTS];

const api = {
  get: async (url: string, config?: any) => {
    try {
      const res = await client.get(url, config);
      return res;
    } catch (e) {
      if (url === '/users') {
        return { data: MOCK_USERS };
      }
      if (url === '/delivery-status') {
        const delivered = localProjects
          .filter((p) => p.status === 'Completed' || p.current_stage === 'Delivered')
          .map((p) => ({
            id: p.id,
            isbn: p.isbn,
            book_title: p.book_title,
            project_number: p.project_number,
            due_date: p.due_date,
            actual_delivery: p.actual_delivery_date || p.due_date,
            onTime: true
          }));
        const notDelivered = localProjects
          .filter((p) => p.status !== 'Completed' && p.current_stage !== 'Delivered')
          .map((p) => ({
            id: p.id,
            isbn: p.isbn,
            book_title: p.book_title,
            project_number: p.project_number,
            due_date: p.due_date,
            remaining_days: p.days_remaining ?? 5,
            due_label: p.due_label || 'In Progress',
            due_color: p.due_color || 'green'
          }));
        return { data: { delivered, notDelivered } };
      }
      if (url.startsWith('/projects/')) {
        const id = Number(url.split('/')[2]);
        const project = localProjects.find((p) => p.id === id) || localProjects[0];
        const timeline = [
          { id: 1, stage: 'Scanning', completed_at: '2026-09-01 10:00', note: 'Batch intake completed' },
          { id: 2, stage: 'EPDF', completed_at: '2026-09-03 16:30', note: 'OCR and image optimization verified' },
          { id: 3, stage: 'QC', completed_at: '2026-09-05 11:20', note: 'Passed initial visual QC' }
        ];
        return { data: { project, timeline } };
      }
      if (url === '/projects') {
        const params = config?.params || {};
        let items = [...localProjects];
        if (params.search) {
          const s = String(params.search).toLowerCase();
          items = items.filter(
            (p) =>
              p.book_title.toLowerCase().includes(s) ||
              p.project_number.toLowerCase().includes(s) ||
              (p.isbn && p.isbn.toLowerCase().includes(s))
          );
        }
        if (params.status && params.status !== 'All') {
          items = items.filter((p) => p.status === params.status);
        }
        if (params.department && params.department !== 'All') {
          items = items.filter((p) => p.department === params.department);
        }
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const start = (page - 1) * limit;
        return {
          data: {
            items: items.slice(start, start + limit),
            total: items.length
          }
        };
      }
      return { data: {} };
    }
  },

  post: async (url: string, data?: any) => {
    try {
      return await client.post(url, data);
    } catch (e) {
      if (url === '/projects') {
        const newProj: Project = {
          id: Date.now(),
          project_number: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
          book_title: data.book_title || 'Untitled Project',
          isbn: data.isbn || '9780000000000',
          client_name: data.client_name || 'Standard Client',
          project_type: data.project_type || 'EPUB',
          department: data.department || 'EPUB',
          priority: data.priority || 'Normal',
          status: 'In Progress',
          current_stage: 'Scanning',
          completion_percentage: 10,
          due_date: data.due_date || '2026-09-30',
          health_score: 90,
          health_category: 'Good',
          health_risk: 'Low'
        };
        localProjects.unshift(newProj);
        return { data: newProj };
      }
      return { data: {} };
    }
  },

  patch: async (url: string, data?: any) => {
    try {
      return await client.patch(url, data);
    } catch (e) {
      if (url.startsWith('/projects/')) {
        const id = Number(url.split('/')[2]);
        const idx = localProjects.findIndex((p) => p.id === id);
        if (idx >= 0) {
          localProjects[idx] = { ...localProjects[idx], ...data };
          return { data: localProjects[idx] };
        }
      }
      return { data: {} };
    }
  }
};

export default api;

export function downloadExport(path: string, params: Record<string, any>, filename: string) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as any).toString();
  // CSV fallback export
  const headers = ['Project Number', 'Book Title', 'ISBN', 'Department', 'Status', 'Due Date', 'Health Score'];
  const rows = localProjects.map((p) => [
    p.project_number,
    `"${p.book_title.replace(/"/g, '""')}"`,
    p.isbn || '',
    p.department || '',
    p.status,
    p.due_date,
    p.health_score ?? ''
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
