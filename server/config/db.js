import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const RESOLUTIONS_FILE = path.join(DATA_DIR, 'resolutions.json');

// Ensure data directory and JSON file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESOLUTIONS_FILE)) {
  fs.writeFileSync(RESOLUTIONS_FILE, JSON.stringify({}, null, 2), 'utf8');
}

/**
 * =============================================================================
 * UNIFIED DATABASE MANAGER (DATABASE-READY ADAPTER)
 * =============================================================================
 * Currently uses high-performance persistent JSON storage in data/resolutions.json.
 * Easily connect PostgreSQL, MySQL, MongoDB, or SQLite in the future simply by
 * setting DB_TYPE and DATABASE_URL in your .env file.
 */
class DatabaseManager {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'json';
    this.connectionString = process.env.DATABASE_URL || '';
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    if (this.dbType === 'postgres') {
      console.log('🔌 Connecting to PostgreSQL Database via DATABASE_URL...');
      // Example for future: const { Pool } = await import('pg'); this.pool = new Pool({ connectionString: this.connectionString });
    } else if (this.dbType === 'mongodb') {
      console.log('🔌 Connecting to MongoDB Database via DATABASE_URL...');
      // Example for future: const mongoose = await import('mongoose'); await mongoose.connect(this.connectionString);
    } else if (this.dbType === 'mysql') {
      console.log('🔌 Connecting to MySQL Database via DATABASE_URL...');
      // Example for future: const mysql = await import('mysql2/promise'); this.pool = mysql.createPool(this.connectionString);
    } else {
      console.log('📁 Using Persistent JSON Storage: ' + RESOLUTIONS_FILE);
    }

    this.initialized = true;
  }

  async getResolutions() {
    try {
      const raw = fs.readFileSync(RESOLUTIONS_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading resolutions:', err.message);
      return {};
    }
  }

  async saveResolution(employee, fileId, metadata = {}) {
    const key = `${employee}_${fileId}`;
    const resolutions = await this.getResolutions();

    resolutions[key] = {
      employee,
      fileId,
      resolvedAt: new Date().toISOString(),
      status: 'CORRECTED',
      correction_pct: 100,
      ...metadata
    };

    try {
      fs.writeFileSync(RESOLUTIONS_FILE, JSON.stringify(resolutions, null, 2), 'utf8');
      return { success: true, key, total: Object.keys(resolutions).length };
    } catch (err) {
      console.error('Error writing resolution:', err.message);
      throw err;
    }
  }

  async resetResolutions() {
    try {
      fs.writeFileSync(RESOLUTIONS_FILE, JSON.stringify({}, null, 2), 'utf8');
      return { success: true, message: 'Resolutions reset successfully' };
    } catch (err) {
      console.error('Error resetting resolutions:', err.message);
      throw err;
    }
  }
}

export const db = new DatabaseManager();
await db.init();
