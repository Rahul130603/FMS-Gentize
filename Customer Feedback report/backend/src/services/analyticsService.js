const FeedbackModel = require('../models/feedbackModel');

class AnalyticsService {
  static async getRatingAnalytics() {
    return FeedbackModel.getRatingAnalytics();
  }

  static async getTrendAnalytics(interval, compare) {
    const validIntervals = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    const selected = validIntervals.includes(interval) ? interval : 'monthly';
    return FeedbackModel.getTrends(selected, compare !== 'false');
  }
}

module.exports = AnalyticsService;

