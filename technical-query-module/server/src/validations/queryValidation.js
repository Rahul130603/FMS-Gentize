const Joi = require('joi');

const CATEGORIES = [
  'isbn_mismatch', 'download_issue', 'upload_issue', 'missing_file', 'software_bug',
  'access_issue', 'server_issue', 'network_issue', 'performance_issue', 'other',
];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const STATUSES = ['open', 'in_review', 'in_progress', 'resolved', 'closed', 'reopened', 'archived'];

const createQuerySchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  priority: Joi.string().valid(...PRIORITIES).default('normal'),
  isbn: Joi.string().max(30).allow('', null),
  subject: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(8000).required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(200).default(20),
  sortBy: Joi.string(),
  sortDir: Joi.string().valid('asc', 'desc'),
  status: Joi.string().valid(...STATUSES),
  priority: Joi.string().valid(...PRIORITIES),
  category: Joi.string().valid(...CATEGORIES),
  department: Joi.string(),
  isbn: Joi.string(),
  employeeId: Joi.number().integer(),
  adminId: Joi.number().integer(),
  role: Joi.string(),
  year: Joi.number().integer(),
  month: Joi.number().integer().min(1).max(12),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  search: Joi.string().max(200),
  mine: Joi.boolean(),
});

const assignSchema = Joi.object({
  assignedTo: Joi.number().integer().required(),
  note: Joi.string().max(2000).allow('', null),
});

const priorityChangeSchema = Joi.object({
  priority: Joi.string().valid(...PRIORITIES).required(),
  note: Joi.string().max(2000).allow('', null),
});

const statusChangeSchema = Joi.object({
  status: Joi.string().valid(...STATUSES).required(),
  note: Joi.string().max(2000).allow('', null),
});

const notesSchema = Joi.object({
  adminNotes: Joi.string().max(8000).allow('', null),
});

const requestInfoSchema = Joi.object({
  note: Joi.string().min(3).max(2000).required(),
});

const resolveSchema = Joi.object({
  resolutionNotes: Joi.string().min(3).max(8000).required(),
});

const reopenSchema = Joi.object({
  reason: Joi.string().min(3).max(2000).required(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const isbnHistoryQuerySchema = Joi.object({
  isbn: Joi.string().min(1).max(30).required(),
  excludeId: Joi.number().integer(),
});

module.exports = {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  createQuerySchema,
  listQuerySchema,
  assignSchema,
  priorityChangeSchema,
  statusChangeSchema,
  notesSchema,
  requestInfoSchema,
  resolveSchema,
  reopenSchema,
  idParamSchema,
  isbnHistoryQuerySchema,
};
