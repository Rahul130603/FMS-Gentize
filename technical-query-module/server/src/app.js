const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const devAuthRoutes = require('./routes/devAuthRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.corsOrigins.includes('*') ? true : env.corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ success: true, service: 'technical-query-module', status: 'ok' }));

// Standalone/demo-only login (see controllers/devAuthController.js).
// Skip mounting this in production if the host FMS supplies its own auth.
if (!env.isProd) {
  app.use('/api/dev-auth', devAuthRoutes);
}

app.use('/api/technical-queries', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
