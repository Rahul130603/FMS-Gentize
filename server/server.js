import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Delivery Production Count API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// GET /api/deliveries (supports query params: type, customer, status, search, limit, offset)
app.get('/api/deliveries', (req, res) => {
  try {
    const { type, customer, status, search, limit, offset } = req.query;
    const result = db.getAllDeliveries({ type, customer, status, search, limit, offset });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deliveries', message: err.message });
  }
});

// GET /api/deliveries/:id
app.get('/api/deliveries/:id', (req, res) => {
  try {
    const item = db.getDeliveryById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery record', message: err.message });
  }
});

// POST /api/deliveries (single entry)
app.post('/api/deliveries', (req, res) => {
  try {
    const { customer, type } = req.body;
    if (!customer || !type) {
      return res.status(400).json({ error: 'Customer and Type are required fields' });
    }
    const created = db.createDelivery(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create delivery record', message: err.message });
  }
});

// POST /api/deliveries/bulk (sheet / excel / csv import)
app.post('/api/deliveries/bulk', (req, res) => {
  try {
    const { deliveries } = req.body;
    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return res.status(400).json({ error: 'Deliveries array is required and must not be empty' });
    }
    const created = db.createBulkDeliveries(deliveries);
    res.status(201).json({ success: true, count: created.length, deliveries: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk import deliveries', message: err.message });
  }
});

// PUT /api/deliveries/:id/status
app.put('/api/deliveries/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = db.updateDeliveryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status', message: err.message });
  }
});

// DELETE /api/deliveries/:id
app.delete('/api/deliveries/:id', (req, res) => {
  try {
    const deleted = db.deleteDelivery(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }
    res.json({ success: true, message: `Delivery ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete delivery record', message: err.message });
  }
});

// GET /api/kpis
app.get('/api/kpis', (req, res) => {
  try {
    const kpis = db.getKPIs();
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch KPIs', message: err.message });
  }
});

// GET /api/analytics?period=day|week|month
app.get('/api/analytics', (req, res) => {
  try {
    const period = req.query.period || 'day';
    const analytics = db.getAnalytics(period);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: err.message });
  }
});

// GET /api/performance?period=daily|weekly|monthly
app.get('/api/performance', (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const perf = db.getPerformance(period);
    res.json(perf);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performance', message: err.message });
  }
});

// GET /api/top-customers
app.get('/api/top-customers', (req, res) => {
  try {
    const customers = db.getTopCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top customers', message: err.message });
  }
});

// Serve frontend build in production if dist exists
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.listen(PORT, () => {
  console.log(`🚀 Delivery Production API running on http://localhost:${PORT}`);
});
