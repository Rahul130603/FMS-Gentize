/**
 * Centralized environment configuration.
 * Fails fast on missing required values instead of surfacing confusing
 * errors deep inside a request handler later.
 */
require('dotenv').config();

const required = ['DATABASE_URL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  databaseUrl: process.env.DATABASE_URL,
  pgSsl: process.env.PGSSL === 'true',

  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',

  uploadDir: process.env.UPLOAD_DIR || './src/uploads/technical-queries',
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 15,

  corsOrigins: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
