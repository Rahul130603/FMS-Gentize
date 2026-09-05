const FeedbackReportService = require('../services/feedbackReportService');
const AnalyticsService = require('../services/analyticsService');
const ExportService = require('../services/exportService');

class FeedbackReportController {
  // GET /api/reports/feedback/summary
  static async getSummary(req, res, next) {
    try {
      const summary = await FeedbackReportService.getExecutiveSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback
  static async getFeedbackList(req, res, next) {
    try {
      const {
        search,
        isbn,
        title,
        feedbackType,
        rating,
        criticCategory,
        dateRange,
        startDate,
        endDate,
        year,
        month,
        quarter,
        sortBy,
        sortOrder,
        page,
        limit
      } = req.query;

      const result = await FeedbackReportService.getPaginatedReport({
        search,
        isbn,
        title,
        feedbackType,
        rating,
        criticCategory,
        dateRange,
        startDate,
        endDate,
        year,
        month,
        quarter,
        sortBy,
        sortOrder,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      });

      res.json({ success: true, data: result.records, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/isbn/:isbn
  static async getIsbnReport(req, res, next) {
    try {
      const { isbn } = req.params;
      const report = await FeedbackReportService.getIsbnReport(isbn);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/book-titles
  static async getBookTitleReport(req, res, next) {
    try {
      const { query } = req.query;
      const books = await FeedbackReportService.getBookTitleReport(query || '');
      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/positive
  static async getPositiveFeedback(req, res, next) {
    try {
      const result = await FeedbackReportService.getPositiveFeedbackReport(req.query);
      res.json({ success: true, data: result.records, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/negative
  static async getNegativeFeedback(req, res, next) {
    try {
      const result = await FeedbackReportService.getNegativeFeedbackReport(req.query);
      res.json({ success: true, data: result.records, pagination: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/top-appreciated
  static async getTopAppreciated(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const data = await FeedbackReportService.getTopAppreciated(limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/top-criticized
  static async getTopCriticized(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      const data = await FeedbackReportService.getTopCriticized(limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/analytics/ratings
  static async getRatingAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getRatingAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/analytics/trends
  static async getTrends(req, res, next) {
    try {
      const { interval, compare } = req.query;
      const trends = await AnalyticsService.getTrendAnalytics(interval, compare);
      res.json({ success: true, data: trends });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reports/feedback/export
  static async exportReport(req, res, next) {
    try {
      const { format = 'csv', filterType, isbn, year, month, search, feedbackType } = req.query;

      if (format.toLowerCase() === 'pdf') {
        const html = await ExportService.generatePdfHtml({ filterType, isbn, year, month, search, feedbackType });
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }

      if (format.toLowerCase() === 'excel' || format.toLowerCase() === 'xlsx') {
        const xml = await ExportService.generateExcelXml({ filterType, isbn, year, month, search, feedbackType });
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename="FMS_Feedback_Report_${Date.now()}.xls"`);
        return res.send(xml);
      }

      // Default CSV
      const csv = await ExportService.generateCsv({ filterType, isbn, year, month, search, feedbackType });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="FMS_Feedback_Report_${Date.now()}.csv"`);
      return res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/feedback/submit (Public or Customer Endpoint)
  static async submitFeedback(req, res, next) {
    try {
      const newFeedback = await FeedbackReportService.submitFeedback(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer feedback submitted and permanently recorded successfully.',
        data: newFeedback
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FeedbackReportController;

