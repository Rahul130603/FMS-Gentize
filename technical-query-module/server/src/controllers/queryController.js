const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const queryService = require('../services/queryService');
const reportService = require('../services/reportService');
const { query: dbQuery } = require('../config/db');

const create = asyncHandler(async (req, res) => {
  const created = await queryService.createQuery(req.user, req.body, req.files, {
    ip: req.ip,
    browser: req.headers['user-agent'],
  });
  res.status(201).json({ success: true, message: 'Technical query submitted successfully', data: created });
});

const list = asyncHandler(async (req, res) => {
  const result = await queryService.listQueries(req.query, req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const data = await queryService.getQueryDetail(req.params.id, req.user);
  res.json({ success: true, data });
});

const isbnHistory = asyncHandler(async (req, res) => {
  const data = await queryService.getIsbnHistory(req.query.isbn, req.query.excludeId);
  res.json({ success: true, data });
});

/**
 * Personal summary for the logged-in employee's own "Dashboard" landing
 * page — same shape as the admin reports dashboard, but always hard-scoped
 * to the requester's own queries regardless of role (admins have their own
 * global dashboard under /reports/dashboard).
 */
const myDashboard = asyncHandler(async (req, res) => {
  const data = await reportService.getDashboardSummary({ employeeId: req.user.id });
  res.json({ success: true, data });
});

const assign = asyncHandler(async (req, res) => {
  const { rows } = await dbQuery('SELECT full_name FROM users WHERE id = $1', [req.body.assignedTo]);
  if (!rows[0]) throw ApiError.badRequest('Selected admin does not exist');
  const updated = await queryService.assignQuery(req.params.id, req.user, {
    assignedTo: req.body.assignedTo,
    assignedToName: rows[0].full_name,
    note: req.body.note,
  });
  res.json({ success: true, message: 'Query assigned', data: updated });
});

const changePriority = asyncHandler(async (req, res) => {
  const updated = await queryService.changePriority(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Priority updated', data: updated });
});

const changeStatus = asyncHandler(async (req, res) => {
  const updated = await queryService.changeStatus(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Status updated', data: updated });
});

const updateAdminNotes = asyncHandler(async (req, res) => {
  const updated = await queryService.updateAdminNotes(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Notes saved', data: updated });
});

const requestInfo = asyncHandler(async (req, res) => {
  const updated = await queryService.requestMoreInfo(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Information request sent to employee', data: updated });
});

const resolve = asyncHandler(async (req, res) => {
  const updated = await queryService.resolveQuery(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Query resolved', data: updated });
});

const close = asyncHandler(async (req, res) => {
  const updated = await queryService.closeQuery(req.params.id, req.user);
  res.json({ success: true, message: 'Query closed', data: updated });
});

const reopen = asyncHandler(async (req, res) => {
  const updated = await queryService.reopenQuery(req.params.id, req.user, req.body);
  res.json({ success: true, message: 'Query reopened', data: updated });
});

const archive = asyncHandler(async (req, res) => {
  const updated = await queryService.archiveQuery(req.params.id, req.user);
  res.json({ success: true, message: 'Query archived', data: updated });
});

module.exports = {
  create, list, getById, isbnHistory, myDashboard, assign, changePriority, changeStatus,
  updateAdminNotes, requestInfo, resolve, close, reopen, archive,
};
