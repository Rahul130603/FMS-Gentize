const express = require('express');
const queryRoutes = require('./queryRoutes');
const reportRoutes = require('./reportRoutes');
const searchRoutes = require('./searchRoutes');
const metaRoutes = require('./metaRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

/**
 * Mount points. When integrating into the existing FMS Express app,
 * simply do:
 *
 *   const technicalQueryRouter = require('./technical-query-module/server/src/routes');
 *   app.use('/api/technical-queries', technicalQueryRouter);
 *
 * (this file already nests /reports, /search and /meta under that base,
 * matching the paths referenced throughout the client's api/ layer.)
 */
// IMPORTANT: the more specific prefixes (/reports, /search, /meta) must be
// registered BEFORE the catch-all '/' mount. queryRoutes defines a
// GET /:id route that would otherwise swallow e.g. "/search" as if
// :id === "search" before Express ever reaches the routers below.
router.use('/reports', reportRoutes);
router.use('/search', searchRoutes);
router.use('/meta', metaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', queryRoutes);

module.exports = router;
