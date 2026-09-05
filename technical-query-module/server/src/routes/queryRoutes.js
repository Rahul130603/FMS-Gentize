const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../middleware/upload');
const queryController = require('../controllers/queryController');
const commentController = require('../controllers/commentController');
const attachmentController = require('../controllers/attachmentController');
const {
  createQuerySchema, listQuerySchema, assignSchema, priorityChangeSchema,
  statusChangeSchema, notesSchema, requestInfoSchema, resolveSchema,
  reopenSchema, idParamSchema, isbnHistoryQuerySchema,
} = require('../validations/queryValidation');
const { addCommentSchema } = require('../validations/commentValidation');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);

// ---- Create & list -----------------------------------------------------
router.post(
  '/',
  upload.array('attachments', 5),
  validate({ body: createQuerySchema }),
  queryController.create
);

router.get('/', validate({ query: listQuerySchema }), queryController.list);

// Must be registered before the '/:id' route below, otherwise Express
// would match these literal paths as an :id value.
router.get('/isbn-history', validate({ query: isbnHistoryQuerySchema }), queryController.isbnHistory);
router.get('/my-dashboard', queryController.myDashboard);

router.get('/:id', validate({ params: idParamSchema }), queryController.getById);

// ---- Admin workflow actions (audit-logged) -----------------------------
router.patch('/:id/assign', requireAdmin, validate({ params: idParamSchema, body: assignSchema }), queryController.assign);
router.patch('/:id/priority', requireAdmin, validate({ params: idParamSchema, body: priorityChangeSchema }), queryController.changePriority);
router.patch('/:id/status', requireAdmin, validate({ params: idParamSchema, body: statusChangeSchema }), queryController.changeStatus);
router.patch('/:id/admin-notes', requireAdmin, validate({ params: idParamSchema, body: notesSchema }), queryController.updateAdminNotes);
router.post('/:id/request-info', requireAdmin, validate({ params: idParamSchema, body: requestInfoSchema }), queryController.requestInfo);
router.post('/:id/resolve', requireAdmin, validate({ params: idParamSchema, body: resolveSchema }), queryController.resolve);
router.post('/:id/close', requireAdmin, validate({ params: idParamSchema }), queryController.close);
router.post('/:id/reopen', requireAdmin, validate({ params: idParamSchema, body: reopenSchema }), queryController.reopen);
router.post('/:id/archive', requireAdmin, validate({ params: idParamSchema }), queryController.archive);

// ---- Comments ------------------------------------------------------------
router.get('/:id/comments', validate({ params: idParamSchema }), commentController.list);
router.post('/:id/comments', validate({ params: idParamSchema, body: addCommentSchema }), commentController.create);

// ---- Attachments -----------------------------------------------------
router.get('/:id/attachments', validate({ params: idParamSchema }), attachmentController.list);
router.post('/:id/attachments', upload.array('attachments', 5), validate({ params: idParamSchema }), attachmentController.upload);
router.get('/:id/attachments/download-all', validate({ params: idParamSchema }), attachmentController.downloadAll);
router.get(
  '/:id/attachments/:attachmentId/download',
  validate({ params: idParamSchema.keys({ attachmentId: Joi.number().integer().required() }) }),
  attachmentController.download
);

module.exports = router;
