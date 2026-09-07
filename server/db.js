import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'deliveries.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading deliveries.json:', err.message);
    return { deliveries: [], topCustomers: [], analytics: {}, performance: {}, kpis: {} };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB] Error writing deliveries.json:', err.message);
    return false;
  }
}

export const db = {
  // Get all deliveries with optional filtering
  getAllDeliveries: ({ type, customer, status, search, limit, offset, sort } = {}) => {
    const data = readData();
    let list = [...(data.deliveries || [])];

    if (type && type !== 'all') {
      list = list.filter(d => d.type.toLowerCase() === type.toLowerCase());
    }
    if (customer && customer !== 'all') {
      list = list.filter(d => d.customer.toLowerCase() === customer.toLowerCase());
    }
    if (status && status !== 'all') {
      list = list.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        (d.isbn && d.isbn.toLowerCase().includes(q)) ||
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.author && d.author.toLowerCase().includes(q)) ||
        d.customer.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        (d.deliveredBy && d.deliveredBy.toLowerCase().includes(q)) ||
        (d.file && d.file.toLowerCase().includes(q))
      );
    }

    if (sort === 'latest') {
      list.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sort === 'oldest') {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sort === 'qty-desc') {
      list.sort((a, b) => b.qty - a.qty);
    } else if (sort === 'qty-asc') {
      list.sort((a, b) => a.qty - b.qty);
    }

    const total = list.length;
    if (offset !== undefined && limit !== undefined) {
      list = list.slice(Number(offset), Number(offset) + Number(limit));
    }

    return { total, deliveries: list };
  },

  getDeliveryById: (id) => {
    const data = readData();
    return (data.deliveries || []).find(d => d.id === id) || null;
  },

  createDelivery: (newDelivery) => {
    const data = readData();
    const id = newDelivery.id || `DEL-${String(Date.now()).slice(-5)}`;
    const record = {
      id,
      customer: newDelivery.customer || 'ABC Publishing',
      file: newDelivery.file || `${id}_document.pdf`,
      type: newDelivery.type || 'POD',
      qty: Number(newDelivery.qty) || 1,
      date: newDelivery.date || '07 Sep 2026',
      time: newDelivery.time || '12:00 PM',
      deliveredBy: newDelivery.deliveredBy || 'Production Team',
      status: newDelivery.status || 'Delivered',
      timestamp: Date.now()
    };

    data.deliveries.unshift(record);
    writeData(data);
    return record;
  },

  updateDeliveryStatus: (id, status) => {
    const data = readData();
    const index = data.deliveries.findIndex(d => d.id === id);
    if (index === -1) return null;
    data.deliveries[index].status = status;
    writeData(data);
    return data.deliveries[index];
  },

  deleteDelivery: (id) => {
    const data = readData();
    const index = data.deliveries.findIndex(d => d.id === id);
    if (index === -1) return false;
    data.deliveries.splice(index, 1);
    writeData(data);
    return true;
  },

  getKPIs: () => {
    const data = readData();
    return data.kpis || {
      today: 48,
      week: 286,
      month: 1248,
      total: 1864,
      pending: 37,
      successRate: '98.4%',
      typeBreakdown: { POD: 420, EPDF: 356, 'SCANNED FILE': 298, 'E-ISBN': 174 }
    };
  },

  getAnalytics: (period = 'day') => {
    const data = readData();
    const analytics = data.analytics || {};
    return analytics[period] || analytics['day'];
  },

  getPerformance: (period = 'daily') => {
    const data = readData();
    const perf = data.performance || {};
    return perf[period] || perf['daily'];
  },

  getTopCustomers: () => {
    const data = readData();
    return data.topCustomers || [];
  }
};
