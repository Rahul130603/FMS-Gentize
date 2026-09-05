const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate, requireAdmin); // Reports & analytics are an admin/management surface

router.get('/dashboard', reportController.dashboard);
router.get('/employee/:employeeId', reportController.employeeReport);
router.get('/isbn', reportController.isbnReport);
router.get('/category-analytics', reportController.categoryAnalytics);
router.get('/resolution-performance', reportController.resolutionPerformance);
router.get('/trend', reportController.trendReport);
router.get('/pending', reportController.pendingReport);
router.get('/reopened', reportController.reopenedReport);

router.get('/export', reportController.exportFiltered);
router.get('/export/complete', reportController.exportComplete);
router.get('/export/query/:id', reportController.exportSingleQuery);

module.exports = router;
