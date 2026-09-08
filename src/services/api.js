/**
 * API service communicating with the backend Express server
 * Automatically proxies through Vite /api in development, or connects directly in production.
 */

const API_BASE = '/api';

export async function fetchDeliveries(params = {}) {
  const query = new URLSearchParams();
  if (params.type && params.type !== 'all') query.set('type', params.type);
  if (params.customer && params.customer !== 'all') query.set('customer', params.customer);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.limit) query.set('limit', params.limit);
  if (params.offset) query.set('offset', params.offset);

  const res = await fetch(`${API_BASE}/deliveries?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch deliveries: ${res.statusText}`);
  return res.json();
}

export async function fetchDeliveryById(id) {
  const res = await fetch(`${API_BASE}/deliveries/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch delivery ${id}: ${res.statusText}`);
  return res.json();
}

export async function createDelivery(payload) {
  const res = await fetch(`${API_BASE}/deliveries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create delivery: ${res.statusText}`);
  return res.json();
}

export async function createBulkDeliveries(deliveries) {
  const res = await fetch(`${API_BASE}/deliveries/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveries }),
  });
  if (!res.ok) throw new Error(`Failed to bulk import deliveries: ${res.statusText}`);
  return res.json();
}

export async function updateDelivery(id, updates) {
  const res = await fetch(`${API_BASE}/deliveries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update delivery: ${res.statusText}`);
  return res.json();
}

export async function updateDeliveryStatus(id, status) {
  return updateDelivery(id, { status });
}

export async function deleteDelivery(id) {
  const res = await fetch(`${API_BASE}/deliveries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete delivery: ${res.statusText}`);
  return res.json();
}

export async function fetchKpis() {
  const res = await fetch(`${API_BASE}/kpis`);
  if (!res.ok) throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
  return res.json();
}

export async function fetchAnalytics(period = 'day') {
  const res = await fetch(`${API_BASE}/analytics?period=${period}`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return res.json();
}

export async function fetchPerformance(period = 'daily') {
  const res = await fetch(`${API_BASE}/performance?period=${period}`);
  if (!res.ok) throw new Error(`Failed to fetch performance: ${res.statusText}`);
  return res.json();
}

export async function fetchTopCustomers() {
  const res = await fetch(`${API_BASE}/top-customers`);
  if (!res.ok) throw new Error(`Failed to fetch top customers: ${res.statusText}`);
  return res.json();
}
