const db = require('../config/db');

class FeedbackModel {
  // Generate next sequential feedback number for given year
  static async generateFeedbackNumber(year = new Date().getFullYear()) {
    const row = await db.get(
      `SELECT feedback_number FROM customer_feedback 
       WHERE feedback_number LIKE ? 
       ORDER BY feedback_number DESC LIMIT 1`,
      [`FB-${year}-%`]
    );

    let nextSeq = 1;
    if (row && row.feedback_number) {
      const parts = row.feedback_number.split('-');
      if (parts.length === 3) {
        nextSeq = parseInt(parts[2], 10) + 1;
      }
    }
    return `FB-${year}-${String(nextSeq).padStart(5, '0')}`;
  }

  // Insert permanent feedback record
  static async create(data) {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const year = data.submittedAt ? new Date(data.submittedAt).getFullYear() : new Date().getFullYear();
    const feedbackNumber = data.feedbackNumber || await this.generateFeedbackNumber(year);
    const submittedAt = data.submittedAt || new Date().toISOString();

    const sql = `
      INSERT INTO customer_feedback (
        id, feedback_number, isbn, title, feedback_type, rating,
        customer_name, customer_company, comment,
        appreciation_message, critic_message, critic_category,
        submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    await db.run(sql, [
      id,
      feedbackNumber,
      data.isbn.trim(),
      data.title.trim(),
      data.feedbackType.toUpperCase(),
      parseInt(data.rating, 10),
      data.customerName || null,
      data.customerCompany || null,
      data.comment.trim(),
      data.appreciationMessage || null,
      data.criticMessage || null,
      data.criticCategory || null,
      submittedAt
    ]);

    return this.getById(id);
  }

  static async getById(id) {
    return db.get('SELECT * FROM customer_feedback WHERE id = ?', [id]);
  }

  // Executive KPI summary metrics
  static async getSummary() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${currentYear}-${currentMonth}`;

    // 7 days ago
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const startOfYear = `${currentYear}-01-01`;

    const overall = await db.get(`
      SELECT 
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
        ROUND(AVG(rating), 2) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
      FROM customer_feedback
    `);

    const periodCounts = await db.get(`
      SELECT 
        SUM(CASE WHEN submitted_at >= ? THEN 1 ELSE 0 END) as feedback_this_week,
        SUM(CASE WHEN submitted_at LIKE ? THEN 1 ELSE 0 END) as feedback_this_month,
        SUM(CASE WHEN submitted_at >= ? THEN 1 ELSE 0 END) as feedback_this_year
      FROM customer_feedback
    `, [oneWeekAgo, `${yearMonth}%`, startOfYear]);

    const topAppreciated = await this.getTopAppreciated(5);
    const topCriticized = await this.getTopCriticized(5);

    return {
      totalFeedback: overall.total_feedback || 0,
      positiveFeedback: overall.positive_count || 0,
      negativeFeedback: overall.negative_count || 0,
      averageRating: overall.average_rating || 0,
      ratingDistribution: {
        star5: overall.star_5 || 0,
        star4: overall.star_4 || 0,
        star3: overall.star_3 || 0,
        star2: overall.star_2 || 0,
        star1: overall.star_1 || 0
      },
      periods: {
        thisWeek: periodCounts.feedback_this_week || 0,
        thisMonth: periodCounts.feedback_this_month || 0,
        thisYear: periodCounts.feedback_this_year || 0
      },
      topAppreciated,
      topCriticized
    };
  }

  // Paginated and filtered search for data grid
  static async getFilteredFeedback({
    search = '',
    isbn = '',
    title = '',
    feedbackType = '',
    rating = '',
    criticCategory = '',
    dateRange = '',
    startDate = '',
    endDate = '',
    year = '',
    month = '',
    quarter = '',
    sortBy = 'submitted_at',
    sortOrder = 'DESC',
    page = 1,
    limit = 10
  }) {
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push(`(
        feedback_number LIKE ? OR 
        isbn LIKE ? OR 
        title LIKE ? OR 
        customer_name LIKE ? OR 
        customer_company LIKE ? OR 
        comment LIKE ? OR 
        appreciation_message LIKE ? OR 
        critic_message LIKE ? OR
        critic_category LIKE ?
      )`);
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s, s, s, s);
    }

    if (isbn) {
      where.push('isbn LIKE ?');
      params.push(`%${isbn}%`);
    }

    if (title) {
      where.push('title LIKE ?');
      params.push(`%${title}%`);
    }

    if (feedbackType) {
      where.push('feedback_type = ?');
      params.push(feedbackType.toUpperCase());
    }

    if (rating) {
      where.push('rating = ?');
      params.push(parseInt(rating, 10));
    }

    if (criticCategory) {
      where.push('critic_category = ?');
      params.push(criticCategory);
    }

    // Date range filters
    const now = new Date();
    if (dateRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      where.push('submitted_at >= ?');
      params.push(oneWeekAgo);
    } else if (dateRange === 'month') {
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      where.push('submitted_at LIKE ?');
      params.push(`${yearMonth}%`);
    } else if (dateRange === 'quarter') {
      const currQuarter = Math.floor(now.getMonth() / 3) + 1;
      const startM = String((currQuarter - 1) * 3 + 1).padStart(2, '0');
      const endM = String(currQuarter * 3).padStart(2, '0');
      where.push(`submitted_at >= ? AND submitted_at <= ?`);
      params.push(`${now.getFullYear()}-${startM}-01`, `${now.getFullYear()}-${endM}-31 23:59:59`);
    } else if (dateRange === 'year') {
      where.push('submitted_at LIKE ?');
      params.push(`${now.getFullYear()}%`);
    } else if (startDate && endDate) {
      where.push('submitted_at >= ? AND submitted_at <= ?');
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    } else if (year) {
      where.push('submitted_at LIKE ?');
      params.push(`${year}%`);
    }

    if (month && year) {
      where.push('submitted_at LIKE ?');
      params.push(`${year}-${String(month).padStart(2, '0')}%`);
    }

    const whereClause = where.join(' AND ');

    // Allowed sort columns
    const allowedSortCols = ['submitted_at', 'rating', 'feedback_number', 'isbn', 'title', 'feedback_type', 'customer_name'];
    const validSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'submitted_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total records
    const countRow = await db.get(
      `SELECT COUNT(*) as count FROM customer_feedback WHERE ${whereClause}`,
      params
    );
    const totalCount = countRow.count;

    // Fetch records
    const offset = (Math.max(1, page) - 1) * limit;
    const fetchParams = [...params, limit, offset];
    const records = await db.all(
      `SELECT * FROM customer_feedback 
       WHERE ${whereClause} 
       ORDER BY ${validSortCol} ${validSortOrder} 
       LIMIT ? OFFSET ?`,
      fetchParams
    );

    return {
      records,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    };
  }

  // ISBN Deep Dive Report
  static async getIsbnReport(isbn) {
    const cleanIsbn = isbn.trim();
    
    // Overall stats for this ISBN
    const stats = await db.get(`
      SELECT 
        title,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
        ROUND(AVG(rating), 2) as average_rating,
        MIN(submitted_at) as first_feedback_date,
        MAX(submitted_at) as latest_feedback_date,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
      FROM customer_feedback
      WHERE isbn = ?
      GROUP BY isbn
    `, [cleanIsbn]);

    if (!stats) {
      return null;
    }

    // Complete feedback history ordered by submission date (newest first for display, with year grouping)
    const history = await db.all(`
      SELECT * FROM customer_feedback 
      WHERE isbn = ? 
      ORDER BY submitted_at DESC
    `, [cleanIsbn]);

    // Timeline organized chronologically (oldest to newest or year-by-year)
    const timeline = await db.all(`
      SELECT 
        strftime('%Y', submitted_at) as year,
        submitted_at,
        feedback_number,
        rating,
        feedback_type,
        comment,
        appreciation_message,
        critic_message,
        critic_category,
        customer_name,
        customer_company
      FROM customer_feedback
      WHERE isbn = ?
      ORDER BY submitted_at ASC
    `, [cleanIsbn]);

    // Appreciation messages
    const appreciations = history
      .filter(item => item.feedback_type === 'POSITIVE' && (item.appreciation_message || item.comment))
      .map(item => ({
        id: item.id,
        feedbackNumber: item.feedback_number,
        rating: item.rating,
        message: item.appreciation_message || item.comment,
        customerName: item.customer_name,
        company: item.customer_company,
        submittedAt: item.submitted_at
      }));

    // Critic messages & categories
    const critics = history
      .filter(item => item.feedback_type === 'NEGATIVE')
      .map(item => ({
        id: item.id,
        feedbackNumber: item.feedback_number,
        rating: item.rating,
        message: item.critic_message || item.comment,
        category: item.critic_category || 'General Quality',
        customerName: item.customer_name,
        company: item.customer_company,
        submittedAt: item.submitted_at
      }));

    return {
      isbn: cleanIsbn,
      bookTitle: stats.title,
      totalFeedback: stats.total_feedback,
      positiveCount: stats.positive_count,
      negativeCount: stats.negative_count,
      averageRating: stats.average_rating,
      firstFeedbackDate: stats.first_feedback_date,
      latestFeedbackDate: stats.latest_feedback_date,
      ratingDistribution: {
        star5: stats.star_5 || 0,
        star4: stats.star_4 || 0,
        star3: stats.star_3 || 0,
        star2: stats.star_2 || 0,
        star1: stats.star_1 || 0
      },
      customerComments: history.map(h => ({
        id: h.id,
        rating: h.rating,
        comment: h.comment,
        type: h.feedback_type,
        submittedAt: h.submitted_at,
        customerName: h.customer_name
      })),
      appreciationMessages: appreciations,
      criticMessages: critics,
      timeline,
      completeHistory: history
    };
  }

  // Book Title Report - Aggregate by title across different editions/ISBNs
  static async getBookTitleReport(titleQuery = '') {
    let where = '1=1';
    let params = [];

    if (titleQuery) {
      where = 'title LIKE ?';
      params.push(`%${titleQuery}%`);
    }

    const books = await db.all(`
      SELECT 
        title,
        COUNT(DISTINCT isbn) as edition_count,
        GROUP_CONCAT(DISTINCT isbn) as isbns,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
        ROUND(AVG(rating), 2) as average_rating,
        MIN(submitted_at) as first_feedback,
        MAX(submitted_at) as latest_feedback
      FROM customer_feedback
      WHERE ${where}
      GROUP BY title
      ORDER BY total_feedback DESC
    `, params);

    return books.map(b => ({
      title: b.title,
      editionCount: b.edition_count,
      isbns: b.isbns ? b.isbns.split(',') : [],
      totalFeedback: b.total_feedback,
      positiveCount: b.positive_count,
      negativeCount: b.negative_count,
      averageRating: b.average_rating,
      firstFeedback: b.first_feedback,
      latestFeedback: b.latest_feedback
    }));
  }

  // Top 10 Most Appreciated Books (High positive count, highest average rating)
  static async getTopAppreciated(limit = 10) {
    return db.all(`
      SELECT 
        isbn,
        title,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_feedback,
        ROUND(AVG(rating), 2) as average_rating,
        GROUP_CONCAT(DISTINCT appreciation_message) as sample_appreciations
      FROM customer_feedback
      GROUP BY isbn, title
      HAVING positive_feedback > 0
      ORDER BY positive_feedback DESC, average_rating DESC
      LIMIT ?
    `, [limit]);
  }

  // Top 10 Most Criticized Books (High negative count, lowest average rating, complaint topics)
  static async getTopCriticized(limit = 10) {
    const rows = await db.all(`
      SELECT 
        isbn,
        title,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_feedback,
        ROUND(AVG(rating), 2) as average_rating,
        GROUP_CONCAT(DISTINCT critic_category) as categories,
        GROUP_CONCAT(DISTINCT critic_message) as sample_criticisms
      FROM customer_feedback
      GROUP BY isbn, title
      HAVING negative_feedback > 0
      ORDER BY negative_feedback DESC, average_rating ASC
      LIMIT ?
    `, [limit]);

    return rows.map(r => ({
      isbn: r.isbn,
      title: r.title,
      totalFeedback: r.total_feedback,
      negativeFeedback: r.negative_feedback,
      averageRating: r.average_rating,
      repeatedComplaints: r.categories ? r.categories.split(',').filter(Boolean) : [],
      sampleCriticisms: r.sample_criticisms ? r.sample_criticisms.split(',').filter(Boolean).slice(0, 3) : []
    }));
  }

  // Rating Analytics & Distribution Breakdown
  static async getRatingAnalytics() {
    const distribution = await db.all(`
      SELECT 
        rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customer_feedback)), 1) as percentage
      FROM customer_feedback
      GROUP BY rating
      ORDER BY rating DESC
    `);

    const avgRow = await db.get(`
      SELECT ROUND(AVG(rating), 2) as average_rating, COUNT(*) as total_feedback 
      FROM customer_feedback
    `);

    // Critic root-cause categories breakdown
    const criticCategories = await db.all(`
      SELECT 
        COALESCE(critic_category, 'General Critique') as category,
        COUNT(*) as count,
        ROUND(AVG(rating), 2) as avg_rating
      FROM customer_feedback
      WHERE feedback_type = 'NEGATIVE'
      GROUP BY critic_category
      ORDER BY count DESC
    `);

    return {
      averageRating: avgRow.average_rating || 0,
      totalFeedback: avgRow.total_feedback || 0,
      distribution,
      criticCategories
    };
  }

  // Feedback Trends across Daily, Weekly, Monthly, Quarterly, and Yearly intervals
  static async getTrends(interval = 'monthly', compare = true) {
    let groupByFormat = '%Y-%m';
    let labelFormat = 'Monthly';

    if (interval === 'daily') {
      groupByFormat = '%Y-%m-%d';
      labelFormat = 'Daily';
    } else if (interval === 'weekly') {
      groupByFormat = '%Y-W%W';
      labelFormat = 'Weekly';
    } else if (interval === 'quarterly') {
      // In SQLite, calculate quarter via strftime('%m', submitted_at)
      groupByFormat = '%Y-Q' || '%Y-%m';
    } else if (interval === 'yearly') {
      groupByFormat = '%Y';
      labelFormat = 'Yearly';
    }

    let trendData;
    if (interval === 'yearly') {
      trendData = await db.all(`
        SELECT 
          strftime('%Y', submitted_at) as period,
          COUNT(*) as total_count,
          SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
          ROUND(AVG(rating), 2) as average_rating
        FROM customer_feedback
        GROUP BY strftime('%Y', submitted_at)
        ORDER BY period ASC
      `);
    } else if (interval === 'quarterly') {
      trendData = await db.all(`
        SELECT 
          strftime('%Y', submitted_at) || '-Q' || ((CAST(strftime('%m', submitted_at) AS INTEGER) + 2) / 3) as period,
          COUNT(*) as total_count,
          SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
          ROUND(AVG(rating), 2) as average_rating
        FROM customer_feedback
        GROUP BY period
        ORDER BY period ASC
      `);
    } else if (interval === 'daily') {
      trendData = await db.all(`
        SELECT 
          strftime('%Y-%m-%d', submitted_at) as period,
          COUNT(*) as total_count,
          SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
          ROUND(AVG(rating), 2) as average_rating
        FROM customer_feedback
        WHERE submitted_at >= date('now', '-30 days')
        GROUP BY period
        ORDER BY period ASC
      `);
    } else if (interval === 'weekly') {
      trendData = await db.all(`
        SELECT 
          strftime('%Y-W%W', submitted_at) as period,
          COUNT(*) as total_count,
          SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
          ROUND(AVG(rating), 2) as average_rating
        FROM customer_feedback
        GROUP BY period
        ORDER BY period ASC
      `);
    } else {
      // Monthly (default)
      trendData = await db.all(`
        SELECT 
          strftime('%Y-%m', submitted_at) as period,
          COUNT(*) as total_count,
          SUM(CASE WHEN feedback_type = 'POSITIVE' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN feedback_type = 'NEGATIVE' THEN 1 ELSE 0 END) as negative_count,
          ROUND(AVG(rating), 2) as average_rating
        FROM customer_feedback
        GROUP BY strftime('%Y-%m', submitted_at)
        ORDER BY period ASC
      `);
    }

    // Calculate growth / period-over-period comparison
    const comparison = trendData.map((curr, idx, arr) => {
      if (idx === 0) {
        return { ...curr, growthRate: 0, ratingDelta: 0 };
      }
      const prev = arr[idx - 1];
      const growthRate = prev.total_count > 0 
        ? Math.round(((curr.total_count - prev.total_count) / prev.total_count) * 100) 
        : 0;
      const ratingDelta = parseFloat((curr.average_rating - prev.average_rating).toFixed(2));
      return {
        ...curr,
        growthRate,
        ratingDelta,
        previousPeriod: prev.period,
        previousCount: prev.total_count
      };
    });

    return {
      interval,
      data: comparison
    };
  }

  // Get raw list for export (with all filters applied)
  static async getExportData({ filterType = 'all', isbn = '', year = '', month = '', search = '', feedbackType = '' }) {
    let where = ['1=1'];
    let params = [];

    if (filterType === 'isbn' && isbn) {
      where.push('isbn = ?');
      params.push(isbn.trim());
    } else if (filterType === 'annual' && year) {
      where.push('submitted_at LIKE ?');
      params.push(`${year}%`);
    } else if (filterType === 'monthly' && year && month) {
      where.push('submitted_at LIKE ?');
      params.push(`${year}-${String(month).padStart(2, '0')}%`);
    }

    if (feedbackType) {
      where.push('feedback_type = ?');
      params.push(feedbackType.toUpperCase());
    }

    if (search) {
      where.push('(feedback_number LIKE ? OR isbn LIKE ? OR title LIKE ? OR customer_name LIKE ? OR comment LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    const whereClause = where.join(' AND ');
    return db.all(`
      SELECT 
        feedback_number,
        isbn,
        title,
        feedback_type,
        rating,
        customer_name,
        customer_company,
        comment,
        appreciation_message,
        critic_message,
        critic_category,
        submitted_at
      FROM customer_feedback
      WHERE ${whereClause}
      ORDER BY submitted_at DESC
    `, params);
  }
}

module.exports = FeedbackModel;

