const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Shared connection pool. If the host FMS already exposes its own pool,
 * this module can be swapped out for a re-export of that pool without
 * touching any service/controller code (they only import { query, getClient }).
 */
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', err);
});

/**
 * Run a single query. Logs slow queries (>300ms) to help catch missing
 * indexes early, which matters a lot for a table meant to grow for years.
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 300) {
    logger.warn(`Slow query (${duration}ms): ${text.slice(0, 120)}`);
  }
  return result;
}

/**
 * Acquire a client for multi-statement transactions.
 * Usage:
 *   const client = await getClient();
 *   try { await client.query('BEGIN'); ...; await client.query('COMMIT'); }
 *   catch (e) { await client.query('ROLLBACK'); throw e; }
 *   finally { client.release(); }
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };
