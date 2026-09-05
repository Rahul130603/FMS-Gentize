const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const attachmentService = require('../services/attachmentService');
const queryService = require('../services/queryService');
const { isAdminRole } = require('../middleware/auth');

const upload = asyncHandler(async (req, res) => {
  const existing = await queryService.assertQueryExists(req.params.id);
  if (!isAdminRole(req.user.role) && existing.raised_by_id !== req.user.id) {
    throw ApiError.forbidden('You can only attach files to your own query');
  }
  const saved = await attachmentService.saveAttachments(req.params.id, req.files, req.user);
  res.status(201).json({ success: true, message: 'Attachment(s) uploaded', data: saved });
});

const list = asyncHandler(async (req, res) => {
  const attachments = await attachmentService.listAttachments(req.params.id);
  res.json({ success: true, data: attachments });
});

const download = asyncHandler(async (req, res) => {
  const existing = await queryService.assertQueryExists(req.params.id);
  if (!isAdminRole(req.user.role) && existing.raised_by_id !== req.user.id) {
    throw ApiError.forbidden('You do not have access to this attachment');
  }
  const attachment = await attachmentService.getAttachmentById(req.params.attachmentId);
  if (attachment.query_id !== Number(req.params.id)) throw ApiError.notFound('Attachment not found');
  res.download(path.resolve(attachment.filepath), attachment.original_name);
});

const downloadAll = asyncHandler(async (req, res) => {
  const existing = await queryService.assertQueryExists(req.params.id);
  if (!isAdminRole(req.user.role) && existing.raised_by_id !== req.user.id) {
    throw ApiError.forbidden('You do not have access to these attachments');
  }
  await attachmentService.streamAllAsZip(req.params.id, existing.query_number, res);
});

module.exports = { upload, list, download, downloadAll };
