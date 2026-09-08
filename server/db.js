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

    if (!sort || sort === 'latest') {
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sort === 'oldest') {
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
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
      isbn: newDelivery.isbn || `978-0-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
      title: newDelivery.title || 'Untitled Production Book',
      author: newDelivery.author || 'Editorial Board',
      file: newDelivery.file || (newDelivery.title ? `${newDelivery.title.replace(/[^\w\d]/g, '_')}_${newDelivery.type || 'POD'}.pdf` : `${id}_document.pdf`),
      type: newDelivery.type || 'POD',
      qty: Number(newDelivery.qty) || 1,
      date: newDelivery.date || '08 Sep 2026',
      time: newDelivery.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deliveredBy: newDelivery.deliveredBy || 'QC',
      status: newDelivery.status || 'Delivered',
      timestamp: Date.now()
    };

    data.deliveries.unshift(record);
    if (data.kpis) {
      const addQty = record.qty || 1;
      data.kpis.today = (data.kpis.today || 0) + addQty;
      data.kpis.week = (data.kpis.week || 0) + addQty;
      data.kpis.month = (data.kpis.month || 0) + addQty;
      data.kpis.total = (data.kpis.total || 0) + addQty;
      if (data.kpis.typeBreakdown && data.kpis.typeBreakdown[record.type] !== undefined) {
        data.kpis.typeBreakdown[record.type] += addQty;
      }
    }
    writeData(data);
    return record;
  },

  createBulkDeliveries: (records) => {
    const data = readData();
    const createdRecords = [];
    const baseTime = Date.now();
    let totalAddedQty = 0;

    records.forEach((item, idx) => {
      let id = item.id;
      if (!id || (data.deliveries || []).some(d => d.id === id)) {
        id = `DEL-${String(baseTime + idx).slice(-5)}`;
      }
      const qty = Number(item.qty) || 1;
      const record = {
        id,
        customer: item.customer || 'ABC Publishing',
        isbn: item.isbn || `978-0-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
        title: item.title || `Production Volume ${idx + 1}`,
        author: item.author || 'Editorial Board',
        file: item.file || (item.title ? `${item.title.replace(/[^\w\d]/g, '_')}_${item.type || 'POD'}.pdf` : `${id}_document.pdf`),
        type: item.type || 'POD',
        qty,
        date: item.date || '08 Sep 2026',
        time: item.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        deliveredBy: item.deliveredBy || 'QC',
        status: item.status || 'Delivered',
        timestamp: baseTime + idx
      };
      createdRecords.push(record);
      data.deliveries.unshift(record);
      totalAddedQty += qty;

      if (data.kpis?.typeBreakdown && data.kpis.typeBreakdown[record.type] !== undefined) {
        data.kpis.typeBreakdown[record.type] += qty;
      }
    });

    if (data.kpis) {
      data.kpis.today = (data.kpis.today || 0) + totalAddedQty;
      data.kpis.week = (data.kpis.week || 0) + totalAddedQty;
      data.kpis.month = (data.kpis.month || 0) + totalAddedQty;
      data.kpis.total = (data.kpis.total || 0) + totalAddedQty;
    }

    writeData(data);
    return createdRecords;
  },

  updateDelivery: (id, fields = {}) => {
    const data = readData();
    const index = data.deliveries.findIndex(d => d.id === id);
    if (index === -1) return null;
    data.deliveries[index] = { ...data.deliveries[index], ...fields };
    writeData(data);
    return data.deliveries[index];
  },

  updateDeliveryStatus: (id, status) => {
    return db.updateDelivery(id, { status });
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
