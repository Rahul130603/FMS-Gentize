const { query } = require('../config/db');
const { buildQueryFilters } = require('../utils/queryFilters');
const { resolvePeriod } = require('../utils/dateBuckets');

/* ---------------------------------------------------------------------
 * Dashboard summary cards
 * ------------------------------------------------------------------- */
async function getDashboardSummary(filters = {}) {
  const { whereSql, params } = buildQueryFilters(filters, { tableAlias: null });
  const sql = `
    SELECT
      COUNT(*)::int                                                   AS total_queries,
      COUNT(*) FILTER (WHERE status = 'open')::int                    AS open_count,
      COUNT(*) FILTER (WHERE status = 'in_review')::int                AS in_review_count,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int              AS in_progress_count,
      COUNT(*) FILTER (WHERE status = 'resolved')::int                 AS resolved_count,
      COUNT(*) FILTER (WHERE status = 'closed')::int                   AS closed_count,
      COUNT(*) FILTER (WHERE status = 'reopened')::int                 AS reopened_count,
      COUNT(*) FILTER (WHERE status = 'archived')::int                 AS archived_count,
      COUNT(*) FILTER (WHERE priority = 'urgent')::int                 AS urgent_count,
      COUNT(*) FILTER (WHERE priority = 'high')::int                   AS high_count,
      COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed','archived'))::int AS pending_count,
      ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600.0) FILTER (WHERE resolved_at IS NOT NULL)::numeric, 2) AS avg_resolution_hours
    FROM technical_queries
    ${whereSql}`;
  const { rows } = await query(sql, params);
  return rows[0];
}

/* ---------------------------------------------------------------------
 * Employee report
 * ------------------------------------------------------------------- */
async function getEmployeeReport(employeeId) {
  const summarySql = `SELECT * FROM v_tq_employee_summary WHERE raised_by_id = $1`;
  const categoriesSql = `
    SELECT category, COUNT(*)::int AS count
    FROM technical_queries WHERE raised_by_id = $1
    GROUP BY category ORDER BY count DESC LIMIT 5`;
  const isbnSql = `
    SELECT isbn, COUNT(*)::int AS count
    FROM technical_queries WHERE raised_by_id = $1 AND isbn IS NOT NULL AND isbn <> ''
    GROUP BY isbn ORDER BY count DESC LIMIT 5`;
  const monthlySql = `
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*)::int AS count
    FROM technical_queries WHERE raised_by_id = $1 AND created_at > now() - interval '12 months'
    GROUP BY 1 ORDER BY 1`;
  const yearlySql = `
    SELECT EXTRACT(YEAR FROM created_at)::int AS year, COUNT(*)::int AS count
    FROM technical_queries WHERE raised_by_id = $1
    GROUP BY 1 ORDER BY 1`;

  const [summary, categories, isbns, monthly, yearly] = await Promise.all([
    query(summarySql, [employeeId]),
    query(categoriesSql, [employeeId]),
    query(isbnSql, [employeeId]),
    query(monthlySql, [employeeId]),
    query(yearlySql, [employeeId]),
  ]);

  return {
    summary: summary.rows[0] || {
      raised_by_id: employeeId, total_queries: 0, resolved_count: 0, pending_count: 0, reopened_count: 0, avg_resolution_hours: null,
    },
    repeatedCategories: categories.rows,
    mostAffectedIsbns: isbns.rows,
    monthlyActivity: monthly.rows,
    yearlyActivity: yearly.rows,
  };
}

/* ---------------------------------------------------------------------
 * ISBN report
 * ------------------------------------------------------------------- */
async function getIsbnReport(isbn) {
  const summarySql = `SELECT * FROM v_tq_isbn_summary WHERE isbn = $1`;
  const issuesSql = `
    SELECT category, COUNT(*)::int AS count FROM technical_queries
    WHERE isbn = $1 GROUP BY category ORDER BY count DESC`;
  // Full cross-employee history for this ISBN — every query raised for it by
  // anyone, who raised each one, who it's assigned to, and who actually
  // performed the resolve action (from the audit log, since a query can be
  // reassigned after the person who resolves it first picked it up).
  const historySql = `
    SELECT tq.id, tq.query_number, tq.subject, tq.category, tq.priority, tq.status,
           tq.raised_by_name, tq.raised_by_role, tq.department,
           tq.assigned_to_name, tq.created_at, tq.resolved_at, tq.closed_at,
           resolver.actor_name AS resolved_by_name
    FROM technical_queries tq
    LEFT JOIN LATERAL (
      SELECT e.actor_name FROM technical_query_events e
      WHERE e.query_id = tq.id AND e.event_type = 'resolved'
      ORDER BY e.created_at DESC LIMIT 1
    ) resolver ON true
    WHERE tq.isbn = $1
    ORDER BY tq.created_at DESC`;

  const [summary, issues, history] = await Promise.all([
    query(summarySql, [isbn]),
    query(issuesSql, [isbn]),
    query(historySql, [isbn]),
  ]);

  return {
    summary: summary.rows[0] || { isbn, total_queries: 0, distinct_categories: 0, reopened_count: 0, last_reported_at: null },
    repeatedIssues: issues.rows,
    history: history.rows,
  };
}

/* ---------------------------------------------------------------------
 * Category analytics — totals for pie/bar + 12-month trend for line
 * ------------------------------------------------------------------- */
async function getCategoryAnalytics(filters = {}) {
  const { whereSql, params, nextIndex } = buildQueryFilters(filters, { tableAlias: null });
  const totalsSql = `
    SELECT category, COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
           COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed','archived'))::int AS pending
    FROM technical_queries ${whereSql}
    GROUP BY category ORDER BY total DESC`;

  const trendWhere = whereSql ? `${whereSql} AND created_at > now() - interval '12 months'` : `WHERE created_at > now() - interval '12 months'`;
  const trendSql = `
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, category, COUNT(*)::int AS count
    FROM technical_queries ${trendWhere}
    GROUP BY 1, 2 ORDER BY 1, 2`;

  const [totals, trend] = await Promise.all([
    query(totalsSql, params),
    query(trendSql, params),
  ]);

  return { totals: totals.rows, monthlyTrend: trend.rows };
}

/* ---------------------------------------------------------------------
 * Resolution performance by admin
 * ------------------------------------------------------------------- */
async function getResolutionPerformance() {
  const { rows } = await query(`SELECT * FROM v_tq_admin_performance ORDER BY assigned_count DESC`);
  return rows;
}

/* ---------------------------------------------------------------------
 * Trend report with period-over-period comparison
 * ------------------------------------------------------------------- */
async function getTrendReport({ period, bucketsCount, filters = {} }) {
  const { unit, interval, defaultCount } = resolvePeriod(period);
  const count = bucketsCount || defaultCount;

  const { whereSql: extraWhere, params: extraParams } = buildQueryFilters(filters, { tableAlias: 'tq', startParamIndex: 4 });
  const joinCondition = extraWhere ? extraWhere.replace('WHERE', 'AND') : '';

  const bucketQuery = (endTs) => `
    WITH buckets AS (
      SELECT generate_series(($1::timestamptz - ($2::int) * $3::interval), $1::timestamptz - $3::interval, $3::interval) AS bucket_start
    )
    SELECT
      b.bucket_start,
      b.bucket_start + $3::interval AS bucket_end,
      COUNT(tq.id)::int AS total,
      COUNT(*) FILTER (WHERE tq.status = 'resolved')::int AS resolved,
      COUNT(*) FILTER (WHERE tq.priority IN ('high','urgent'))::int AS high_priority
    FROM buckets b
    LEFT JOIN technical_queries tq
      ON tq.created_at >= b.bucket_start AND tq.created_at < b.bucket_start + $3::interval
      ${joinCondition}
    GROUP BY b.bucket_start
    ORDER BY b.bucket_start`;

  const now = new Date();
  const current = await query(bucketQuery(now), [now.toISOString(), count, interval, ...extraParams]);

  // Previous period of identical length, ending exactly where the current one starts
  const currentStart = current.rows.length ? current.rows[0].bucket_start : now;
  const previous = await query(bucketQuery(currentStart), [currentStart, count, interval, ...extraParams]);

  const sum = (rows, key) => rows.reduce((acc, r) => acc + Number(r[key] || 0), 0);
  const currentTotal = sum(current.rows, 'total');
  const previousTotal = sum(previous.rows, 'total');
  const percentChange = previousTotal === 0 ? null : Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10;

  return {
    period: unit,
    current: current.rows,
    previous: previous.rows,
    comparison: { currentTotal, previousTotal, percentChange },
  };
}

/* ---------------------------------------------------------------------
 * Pending / aging report
 * ------------------------------------------------------------------- */
async function getPendingReport() {
  const bucketSql = `
    SELECT
      CASE
        WHEN pending_days <= 2 THEN '0-2'
        WHEN pending_days <= 7 THEN '3-7'
        WHEN pending_days <= 15 THEN '8-15'
        ELSE '15+'
      END AS bucket,
      COUNT(*)::int AS count
    FROM v_tq_with_resolution
    WHERE pending_days IS NOT NULL
    GROUP BY 1`;

  const overdueSql = `
    SELECT id, query_number, subject, priority, status, raised_by_name, assigned_to_name,
           created_at, pending_days
    FROM v_tq_with_resolution
    WHERE pending_days IS NOT NULL AND priority IN ('urgent','high') AND pending_days > 2
    ORDER BY pending_days DESC
    LIMIT 50`;

  const [buckets, overdue] = await Promise.all([query(bucketSql), query(overdueSql)]);

  const bucketMap = { '0-2': 0, '3-7': 0, '8-15': 0, '15+': 0 };
  buckets.rows.forEach((r) => { bucketMap[r.bucket] = r.count; });

  return { buckets: bucketMap, overdueUrgent: overdue.rows };
}

/* ---------------------------------------------------------------------
 * Reopened report
 * ------------------------------------------------------------------- */
async function getReopenedReport() {
  const sql = `
    SELECT
      tq.id, tq.query_number, tq.subject, tq.raised_by_name, tq.assigned_to_name,
      tq.status AS current_status, tq.reopen_reason,
      (SELECT MAX(e.created_at) FROM technical_query_events e
        WHERE e.query_id = tq.id AND e.event_type = 'resolved'
          AND e.created_at < (SELECT MIN(e2.created_at) FROM technical_query_events e2
                               WHERE e2.query_id = tq.id AND e2.event_type = 'reopened')
      ) AS original_resolution_date,
      (SELECT MIN(e.created_at) FROM technical_query_events e
        WHERE e.query_id = tq.id AND e.event_type = 'reopened') AS reopened_date
    FROM technical_queries tq
    WHERE tq.reopen_count > 0 OR tq.status = 'reopened'
    ORDER BY reopened_date DESC NULLS LAST`;
  const { rows } = await query(sql);
  return rows;
}

module.exports = {
  getDashboardSummary,
  getEmployeeReport,
  getIsbnReport,
  getCategoryAnalytics,
  getResolutionPerformance,
  getTrendReport,
  getPendingReport,
  getReopenedReport,
};
