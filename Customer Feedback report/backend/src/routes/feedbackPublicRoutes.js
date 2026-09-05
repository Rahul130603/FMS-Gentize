const express = require('express');
const router = express.Router();
const FeedbackReportController = require('../controllers/feedbackReportController');

// Public customer submission endpoint
router.post('/submit', FeedbackReportController.submitFeedback);

module.exports = router;

