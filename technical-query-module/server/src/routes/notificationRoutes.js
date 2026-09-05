const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.patch(
  '/:id/read',
  validate({ params: Joi.object({ id: Joi.number().integer().required() }) }),
  notificationController.markRead
);
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
