import axios from 'axios';
import { Project, UserOption } from './types';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function isHtmlOrInvalid(res: any) {
  if (!res || !res.data) return true;
  if (typeof res.data === 'string') return true;
  if (res.headers && String(res.headers['content-type']).includes('text/html')) return true;
  return false;
}

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

export function normalizeProject(p: any): Project {
  const stage = p.workflow_stage || p.current_stage || 'In Progress';
  const score = p.health_score ?? p.health?.score ?? 85;
  const category =
    p.health_category ??
    p.health?.category ??
    (score >= 90 ? 'Excellent' : score >= 75 ? 'Healthy' : score >= 60 ? 'Needs Attention' : 'Critical');
  const risk =
    p.health_risk ??
    p.health?.risk ??
    (score >= 80 ? 'Low Risk' : score >= 60 ? 'Medium Risk' : 'High Risk');
  const daysRem = p.remaining_days ?? p.days_remaining ?? 5;
  const dueLabel =
    p.due_label ??
    p.health?.daysRemaining?.label ??
    (daysRem < 0 ? `Overdue by ${Math.abs(daysRem)}d` : daysRem === 0 ? 'Due today' : `Due in ${daysRem}d`);
  const dueColor =
    p.due_color ??
    p.health?.daysRemaining?.color ??
    (daysRem < 0 ? '#ef4444' : daysRem <= 2 ? '#f59e0b' : '#16a34a');

  return {
    id: p.id,
    project_number: p.project_number,
    isbn: p.isbn || '',
    book_title: p.book_title,
    client_name: p.client_name || '',
    project_type: p.project_type || 'EPUB',
    department: p.department || 'EPUB',
    assigned_to: p.assigned_to,
    assignedEmployee:
      p.assignedEmployee ||
      (p.assigned_to ? { id: p.assigned_to, name: MOCK_USERS.find((u) => u.id === p.assigned_to)?.name || `User ${p.assigned_to}` } : undefined),
    manager: p.manager,
    managerUser:
      p.managerUser ||
      (p.manager ? { id: p.manager, name: MOCK_USERS.find((u) => u.id === p.manager)?.name || `Manager ${p.manager}` } : undefined),
    priority: p.priority || 'Normal',
    workflow_stage: stage,
    completion_percentage: p.completion_percentage ?? 50,
    start_date: p.start_date || '2026-09-01',
    expected_delivery: p.expected_delivery || p.due_date || '2026-09-15',
    due_date: p.due_date || '2026-09-15',
    actual_delivery: p.actual_delivery || p.actual_delivery_date,
    status: p.status || 'In Progress',
    remarks: p.remarks || '',
    created_at: p.created_at || '2026-09-01T08:00:00Z',
    updated_at: p.updated_at || '2026-09-07T08:00:00Z',
    delay_days: p.delay_days ?? (daysRem < 0 ? Math.abs(daysRem) : 0),
    remaining_days: daysRem,
    recommendations:
      Array.isArray(p.recommendations) && p.recommendations.length > 0
        ? p.recommendations
        : [
            score < 70
              ? 'Review high-risk timeline and expedite QC stage.'
              : 'On track with current stage deliverables. Maintain milestone rhythm.'
          ],
    milestones: p.milestones || [
      { id: 1, stage: 'Scanning', expected_date: '2026-09-02', actual_completed_date: '2026-09-02' },
      { id: 2, stage: 'EPDF', expected_date: '2026-09-06', actual_completed_date: score > 70 ? '2026-09-05' : undefined },
      { id: 3, stage: 'QC', expected_date: '2026-09-10' },
      { id: 4, stage: 'Ready for Delivery', expected_date: p.due_date || '2026-09-15' }
    ],
    health: p.health || {
      score,
      category,
      risk,
      completion: {
        score: Math.round((p.completion_percentage ?? 50) * 0.3),
        max: 30,
        percentage: p.completion_percentage ?? 50,
        status: { label: (p.completion_percentage ?? 50) >= 80 ? 'Advanced' : 'In Progress', color: '#16a34a' }
      },
      daysRemaining: {
        score: daysRem > 3 ? 30 : daysRem >= 0 ? 15 : 0,
        max: 30,
        remaining: daysRem,
        label: dueLabel,
        color: dueColor
      },
      workflow: {
        score: 20,
        max: 20,
        currentStage: stage,
        completedStages: ['Scanning'],
        remainingStages: ['EPDF', 'QC', 'Ready for Delivery']
      },
      priority: {
        score: 10,
        max: 10,
        level: p.priority || 'Normal'
      },
      missedMilestones: {
        score: 10,
        max: 10,
        count: daysRem < 0 ? 1 : 0,
        items: daysRem < 0 ? [{ stage, expected_date: p.due_date, delayDays: Math.abs(daysRem) }] : []
      }
    }
  };
}

const RAW_MOCK_PROJECTS = [
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
    workflow_stage: 'EPDF',
    completion_percentage: 65,
    due_date: '2026-09-12',
    actual_delivery: undefined,
    health_score: 88,
    health_category: 'Healthy',
    health_risk: 'Low Risk',
    days_remaining: 5,
    due_label: 'Due in 5 days',
    due_color: '#16a34a',
    recommendations: ['Milestone EPDF is on track. Expedite QC review.']
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
    workflow_stage: 'Ready for Delivery',
    completion_percentage: 95,
    due_date: '2026-09-08',
    actual_delivery: undefined,
    health_score: 94,
    health_category: 'Excellent',
    health_risk: 'Low Risk',
    days_remaining: 1,
    due_label: 'Due tomorrow',
    due_color: '#f59e0b',
    recommendations: ['Perform final pre-flight verification before client handoff.']
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
    workflow_stage: 'Delivered',
    completion_percentage: 100,
    due_date: '2026-09-04',
    actual_delivery: '2026-09-03',
    health_score: 99,
    health_category: 'Excellent',
    health_risk: 'Low Risk',
    days_remaining: 0,
    due_label: 'Delivered On-Time',
    due_color: '#16a34a',
    recommendations: ['Delivery complete. Archived into cold storage.']
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
    workflow_stage: 'QC',
    completion_percentage: 80,
    due_date: '2026-09-06',
    actual_delivery: undefined,
    health_score: 62,
    health_category: 'Needs Attention',
    health_risk: 'Medium Risk',
    days_remaining: -1,
    due_label: 'Overdue by 1 day',
    due_color: '#ef4444',
    delay_days: 1,
    recommendations: ['Immediate manager intervention required for overdue QC check.']
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
    workflow_stage: 'Scanning',
    completion_percentage: 30,
    due_date: '2026-09-20',
    actual_delivery: undefined,
    health_score: 75,
    health_category: 'Healthy',
    health_risk: 'Low Risk',
    days_remaining: 13,
    due_label: 'Due in 13 days',
    due_color: '#16a34a',
    recommendations: ['Proceed with intake scan OCR validation.']
  }
];

export const MOCK_PROJECTS: Project[] = RAW_MOCK_PROJECTS.map(normalizeProject);

let localProjects: Project[] = [...MOCK_PROJECTS];

const api = {
  get: async (url: string, config?: any) => {
    try {
      const res = await client.get(url, config);
      if (isHtmlOrInvalid(res)) {
        throw new Error('API fallback to mock');
      }
      return res;
    } catch (e) {
      if (url === '/users') {
        return { data: MOCK_USERS };
      }
      if (url === '/delivery-status' || url === '/reports/delivery-status' || url.includes('delivery-status')) {
        const delivered = localProjects
          .filter((p) => p.status === 'Completed' || p.workflow_stage === 'Delivered' || !!p.actual_delivery)
          .map((p) => ({
            id: p.id,
            isbn: p.isbn,
            book_title: p.book_title,
            project_number: p.project_number,
            due_date: p.due_date,
            actual_delivery: p.actual_delivery || p.due_date,
            onTime: !p.delay_days || p.delay_days <= 0
          }));
        const notDelivered = localProjects
          .filter((p) => p.status !== 'Completed' && p.workflow_stage !== 'Delivered' && !p.actual_delivery)
          .map((p) => ({
            id: p.id,
            isbn: p.isbn,
            book_title: p.book_title,
            project_number: p.project_number,
            due_date: p.due_date,
            remaining_days: p.remaining_days ?? 5,
            due_label: p.health?.daysRemaining?.label || (p.due_date ? `Due ${p.due_date}` : 'In Progress'),
            due_color: p.health?.daysRemaining?.color || '#16a34a'
          }));
        return { data: { delivered, notDelivered } };
      }
      if (url.startsWith('/projects/')) {
        const id = Number(url.split('/')[2]);
        const found = localProjects.find((p) => p.id === id) || localProjects[0];
        const project = normalizeProject(found);
        const timeline = [
          { id: 1, project_id: project.id, event: 'Intake and batch scanning logged', created_at: '2026-09-01T10:00:00Z', note: 'Batch intake completed' },
          { id: 2, project_id: project.id, event: 'EPDF generation and OCR check', created_at: '2026-09-03T16:30:00Z', note: 'OCR verified' },
          { id: 3, project_id: project.id, event: 'Milestone milestone QC inspection', created_at: '2026-09-05T11:20:00Z', note: 'Passed initial visual QC' }
        ];
        return { data: { project, timeline } };
      }
      if (url.startsWith('/projects') || url === '/projects') {
        const params = config?.params || {};
        let items = localProjects.map(normalizeProject);
        if (params.q || params.search) {
          const s = String(params.q || params.search).toLowerCase();
          items = items.filter(
            (p) =>
              p.book_title.toLowerCase().includes(s) ||
              p.project_number.toLowerCase().includes(s) ||
              (p.isbn && p.isbn.toLowerCase().includes(s)) ||
              (p.client_name && p.client_name.toLowerCase().includes(s))
          );
        }
        if (params.status && params.status !== 'All' && params.status !== '') {
          items = items.filter((p) => p.status === params.status);
        }
        if (params.priority && params.priority !== 'All' && params.priority !== '') {
          items = items.filter((p) => p.priority === params.priority);
        }
        if (params.department && params.department !== 'All' && params.department !== '') {
          items = items.filter((p) => p.department === params.department);
        }
        if (params.workflow_stage && params.workflow_stage !== 'All' && params.workflow_stage !== '') {
          items = items.filter((p) => p.workflow_stage === params.workflow_stage);
        }
        if (params.project_type && params.project_type !== 'All' && params.project_type !== '') {
          items = items.filter((p) => p.project_type === params.project_type);
        }
        if (params.health_category && params.health_category !== '') {
          items = items.filter((p) => p.health.category === params.health_category);
        }
        if (params.assigned_to && params.assigned_to !== '') {
          items = items.filter((p) => String(p.assigned_to) === String(params.assigned_to));
        }
        if (params.manager && params.manager !== '') {
          items = items.filter((p) => String(p.manager) === String(params.manager));
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
      const res = await client.post(url, data);
      if (isHtmlOrInvalid(res)) {
        throw new Error('API fallback to mock');
      }
      return res;
    } catch (e) {
      if (url === '/projects') {
        const raw = {
          id: Date.now(),
          project_number: data.project_number || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
          book_title: data.book_title || 'Untitled Project',
          isbn: data.isbn || '9780000000000',
          client_name: data.client_name || 'Standard Client',
          project_type: data.project_type || 'EPUB',
          department: data.department || 'EPUB',
          assigned_to: data.assigned_to ? Number(data.assigned_to) : undefined,
          manager: data.manager ? Number(data.manager) : undefined,
          priority: data.priority || 'Normal',
          status: 'In Progress',
          workflow_stage: data.workflow_stage || 'Scanning',
          completion_percentage: Number(data.completion_percentage) || 10,
          due_date: data.due_date || '2026-09-30',
          start_date: data.start_date || '2026-09-01',
          remarks: data.remarks || '',
          health_score: 90,
          health_category: 'Healthy',
          health_risk: 'Low Risk'
        };
        const newProj = normalizeProject(raw);
        localProjects.unshift(newProj);
        return { data: newProj };
      }
      return { data: {} };
    }
  },

  patch: async (url: string, data?: any) => {
    try {
      const res = await client.patch(url, data);
      if (isHtmlOrInvalid(res)) {
        throw new Error('API fallback to mock');
      }
      return res;
    } catch (e) {
      if (url.includes('/milestones/') && url.includes('/complete')) {
        const parts = url.split('/');
        const projId = Number(parts[2]);
        const mId = Number(parts[4]);
        const p = localProjects.find((x) => x.id === projId);
        if (p && p.milestones) {
          const m = p.milestones.find((x) => x.id === mId);
          if (m) m.actual_completed_date = data?.actual_completed_date || new Date().toISOString().slice(0, 10);
        }
        return { data: { success: true } };
      }
      if (url.startsWith('/projects/')) {
        const id = Number(url.split('/')[2]);
        const idx = localProjects.findIndex((p) => p.id === id);
        if (idx >= 0) {
          localProjects[idx] = normalizeProject({ ...localProjects[idx], ...data });
          return { data: localProjects[idx] };
        }
      }
      return { data: {} };
    }
  }
};

export default api;

export function downloadExport(path: string, params: Record<string, any>, filename: string) {
  const headers = ['Project Number', 'Book Title', 'ISBN', 'Department', 'Status', 'Due Date', 'Health Score'];
  const rows = localProjects.map((p) => [
    p.project_number,
    `"${p.book_title.replace(/"/g, '""')}"`,
    p.isbn || '',
    p.department || '',
    p.status,
    p.due_date,
    p.health?.score ?? 85
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
