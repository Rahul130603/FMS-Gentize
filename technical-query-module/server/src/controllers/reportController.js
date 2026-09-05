const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const reportService = require('../services/reportService');
const queryService = require('../services/queryService');
const { query } = require('../config/db');
const { buildQueryFilters } = require('../utils/queryFilters');
const { buildExcelBuffer, buildCsv, buildPdfBuffer } = require('../utils/exportHelpers');

const dashboard = asyncHandler(async (req, res) => {
  const data = await reportService.getDashboardSummary(req.query);
  res.json({ success: true, data });
});

const employeeReport = asyncHandler(async (req, res) => {
  const data = await reportService.getEmployeeReport(req.params.employeeId);
  res.json({ success: true, data });
});

const isbnReport = asyncHandler(async (req, res) => {
  if (!req.query.isbn) throw ApiError.badRequest('isbn query parameter is required');
  const data = await reportService.getIsbnReport(req.query.isbn);
  res.json({ success: true, data });
});

const categoryAnalytics = asyncHandler(async (req, res) => {
  const data = await reportService.getCategoryAnalytics(req.query);
  res.json({ success: true, data });
});

const resolutionPerformance = asyncHandler(async (req, res) => {
  const data = await reportService.getResolutionPerformance();
  res.json({ success: true, data });
});

const trendReport = asyncHandler(async (req, res) => {
  const data = await reportService.getTrendReport({
    period: req.query.period,
    bucketsCount: req.query.buckets ? parseInt(req.query.buckets, 10) : undefined,
    filters: req.query,
  });
  res.json({ success: true, data });
});

const pendingReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPendingReport();
  res.json({ success: true, data });
});

const reopenedReport = asyncHandler(async (req, res) => {
  const data = await reportService.getReopenedReport();
  res.json({ success: true, data });
});

/* ------------------------------------------------------------------
 * Exports — Excel / CSV / PDF, for filtered results, the complete
 * report, or a single query.
 * ---------------------------------------------------------------- */
const EXPORT_COLUMNS = [
  { header: 'Query Number', key: 'query_number', width: 18 },
  { header: 'Subject', key: 'subject', width: 32 },
  { header: 'Employee', key: 'raised_by_name', width: 20 },
  { header: 'Department', key: 'department', width: 18 },
  { header: 'ISBN', key: 'isbn', width: 18 },
  { header: 'Category', key: 'category', width: 16 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Status', key: 'status', width: 14 },
  { header: 'Assigned To', key: 'assigned_to_name', width: 18 },
  { header: 'Created At', key: 'created_at', width: 20 },
  { header: 'Resolved At', key: 'resolved_at', width: 20 },
];

async function fetchExportRows(filters, complete) {
  const { whereSql, params } = complete ? { whereSql: '', params: [] } : buildQueryFilters(filters, { tableAlias: null });
  const sql = `
    SELECT query_number, subject, raised_by_name, department, isbn, category, priority,
           status, assigned_to_name, created_at, resolved_at
    FROM technical_queries ${whereSql} ORDER BY created_at DESC`;
  const { rows } = await query(sql, params);
  return rows;
}

async function sendExport(res, { format, title, rows, columns }) {
  if (format === 'excel') {
    const buffer = await buildExcelBuffer({ title, columns, rows });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.xlsx"`);
    return res.send(buffer);
  }
  if (format === 'pdf') {
    const buffer = await buildPdfBuffer({ title, subtitle: `Generated ${new Date().toLocaleString()}`, columns, rows });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
    return res.send(buffer);
  }
  // default: csv
  const csv = buildCsv({ columns, rows });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.csv"`);
  return res.send(csv);
}

const exportFiltered = asyncHandler(async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const rows = await fetchExportRows(req.query, false);
  await sendExport(res, { format, title: 'Technical_Query_Report_Filtered', rows, columns: EXPORT_COLUMNS });
});

const exportComplete = asyncHandler(async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const rows = await fetchExportRows({}, true);
  await sendExport(res, { format, title: 'Technical_Query_Report_Complete', rows, columns: EXPORT_COLUMNS });
});

const exportSingleQuery = asyncHandler(async (req, res) => {
  const format = (req.query.format || 'pdf').toLowerCase();
  const detail = await queryService.getQueryDetail(req.params.id, req.user);
  const columns = [
    { header: 'Field', key: 'field', width: 24 },
    { header: 'Value', key: 'value', width: 60 },
  ];
  const rows = [
    { field: 'Query Number', value: detail.query_number },
    { field: 'Subject', value: detail.subject },
    { field: 'Employee', value: detail.raised_by_name },
    { field: 'Department', value: detail.department },
    { field: 'ISBN', value: detail.isbn || '-' },
    { field: 'Category', value: detail.category },
    { field: 'Priority', value: detail.priority },
    { field: 'Status', value: detail.status },
    { field: 'Assigned To', value: detail.assigned_to_name || '-' },
    { field: 'Description', value: detail.description },
    { field: 'Resolution Notes', value: detail.resolution_notes || '-' },
    { field: 'Created At', value: detail.created_at },
    { field: 'Resolved At', value: detail.resolved_at || '-' },
    { field: 'Closed At', value: detail.closed_at || '-' },
  ];
  await sendExport(res, { format, title: `${detail.query_number}`, rows, columns });
});

module.exports = {
  dashboard, employeeReport, isbnReport, categoryAnalytics, resolutionPerformance,
  trendReport, pendingReport, reopenedReport, exportFiltered, exportComplete, exportSingleQuery,
};
