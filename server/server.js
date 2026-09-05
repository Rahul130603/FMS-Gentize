import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;
const DIST_DIR = path.join(__dirname, '../dist');
const ROOT_DIR = path.join(__dirname, '..');

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// REST API Endpoints
app.use('/api', apiRoutes);

// Static Asset Serving (Serves the user's exact original UI index.html)
app.use(express.static(ROOT_DIR));
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(` 🚀 REWORK ROUND ANALYSIS - FULL-STACK BACKEND SERVER`);
  console.log(` 📡 Server Port : http://localhost:${PORT}/`);
  console.log(` ⚡ API Routes  : http://localhost:${PORT}/api/dashboard`);
  console.log(` 🗄️ Database     : ${process.env.DB_TYPE || 'json'} (Ready for PostgreSQL/MySQL/MongoDB)`);
  console.log(`=============================================================`);
});
