const express = require('express');
const router = express.Router();
const FeedbackReportController = require('../controllers/feedbackReportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply authentication and strict Admin requirement to all report endpoints
router.use(authenticate);
router.use(requireAdmin);

// Dashboard Summary KPI Cards
router.get('/summary', FeedbackReportController.getSummary);

// Paginated and Filtered All Feedback Grid
router.get('/feedback', FeedbackReportController.getFeedbackList);

// ISBN Deep Dive & Timeline
router.get('/feedback/isbn/:isbn', FeedbackReportController.getIsbnReport);

// Book Title Edition Aggregation
router.get('/feedback/book-titles', FeedbackReportController.getBookTitleReport);

// Positive Feedback Only
router.get('/feedback/positive', FeedbackReportController.getPositiveFeedback);

// Negative / Critic Feedback Only
router.get('/feedback/negative', FeedbackReportController.getNegativeFeedback);

// Top 10 Most Appreciated Books
router.get('/feedback/top-appreciated', FeedbackReportController.getTopAppreciated);

// Top 10 Most Criticized Books
router.get('/feedback/top-criticized', FeedbackReportController.getTopCriticized);

// Rating Analytics & Distribution
router.get('/feedback/analytics/ratings', FeedbackReportController.getRatingAnalytics);

// Trends (Daily, Weekly, Monthly, Quarterly, Yearly)
router.get('/feedback/analytics/trends', FeedbackReportController.getTrends);

// Export (Excel, PDF, CSV)
router.get('/feedback/export', FeedbackReportController.exportReport);

module.exports = router;

