/**
 * =============================================================================
 * FRONTEND API SERVICE (CONNECTS REACT TO NODE.JS BACKEND)
 * =============================================================================
 */

const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Healthcheck failed');
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return null;
  }
}

export async function fetchEmployees() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return await res.json();
  } catch (err) {
    console.error('fetchEmployees error:', err);
    throw err;
  }
}

export async function fetchDashboard(employee, date, period = 'day', filters = {}) {
  try {
    const params = new URLSearchParams({
      employee: employee || 'SUDHIN',
      date: date || '05-09-2026',
      period: period || 'day',
      role: filters.role || 'All',
      status: filters.status || 'All'
    });

    const res = await fetch(`${API_BASE}/dashboard?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return await res.json();
  } catch (err) {
    console.error('fetchDashboard error:', err);
    throw err;
  }
}

export async function resolveFile(employee, fileId, metadata = {}) {
  try {
    const res = await fetch(`${API_BASE}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employee, fileId, metadata })
    });
    if (!res.ok) throw new Error('Failed to resolve file');
    return await res.json();
  } catch (err) {
    console.error('resolveFile error:', err);
    throw err;
  }
}

export async function resetResolutions() {
  try {
    const res = await fetch(`${API_BASE}/reset-resolutions`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset resolutions');
    return await res.json();
  } catch (err) {
    console.error('resetResolutions error:', err);
    throw err;
  }
}
