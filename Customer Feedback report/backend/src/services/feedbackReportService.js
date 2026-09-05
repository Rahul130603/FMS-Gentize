const FeedbackModel = require('../models/feedbackModel');

class FeedbackReportService {
  static async getExecutiveSummary() {
    return FeedbackModel.getSummary();
  }

  static async getPaginatedReport(filters) {
    return FeedbackModel.getFilteredFeedback(filters);
  }

  static async getIsbnReport(isbn) {
    const report = await FeedbackModel.getIsbnReport(isbn);
    if (!report) {
      const err = new Error(`No customer feedback found for ISBN: ${isbn}`);
      err.statusCode = 404;
      throw err;
    }
    return report;
  }

  static async getBookTitleReport(titleQuery) {
    return FeedbackModel.getBookTitleReport(titleQuery);
  }

  static async getPositiveFeedbackReport(filters) {
    return FeedbackModel.getFilteredFeedback({
      ...filters,
      feedbackType: 'POSITIVE'
    });
  }

  static async getNegativeFeedbackReport(filters) {
    return FeedbackModel.getFilteredFeedback({
      ...filters,
      feedbackType: 'NEGATIVE'
    });
  }

  static async getTopAppreciated(limit) {
    return FeedbackModel.getTopAppreciated(limit);
  }

  static async getTopCriticized(limit) {
    return FeedbackModel.getTopCriticized(limit);
  }

  static async submitFeedback(feedbackData) {
    if (!feedbackData.isbn || !feedbackData.title || !feedbackData.feedbackType || !feedbackData.rating || !feedbackData.comment) {
      const err = new Error('ISBN, Title, Feedback Type, Rating (1-5), and Comment are required fields.');
      err.statusCode = 400;
      throw err;
    }

    const rating = parseInt(feedbackData.rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      const err = new Error('Rating must be an integer between 1 and 5.');
      err.statusCode = 400;
      throw err;
    }

    const type = feedbackData.feedbackType.toUpperCase();
    if (type !== 'POSITIVE' && type !== 'NEGATIVE') {
      const err = new Error('Feedback Type must be either POSITIVE or NEGATIVE.');
      err.statusCode = 400;
      throw err;
    }

    return FeedbackModel.create({
      isbn: feedbackData.isbn,
      title: feedbackData.title,
      feedbackType: type,
      rating,
      customerName: feedbackData.customerName,
      customerCompany: feedbackData.customerCompany,
      comment: feedbackData.comment,
      appreciationMessage: feedbackData.appreciationMessage,
      criticMessage: feedbackData.criticMessage,
      criticCategory: feedbackData.criticCategory,
      submittedAt: feedbackData.submittedAt
    });
  }
}

module.exports = FeedbackReportService;

