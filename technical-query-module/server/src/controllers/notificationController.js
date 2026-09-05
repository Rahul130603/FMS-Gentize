const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const list = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const data = await notificationService.listForUser(req.user.id, { limit });
  res.json({ success: true, data });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user.id);
  res.json({ success: true, data: { count } });
});

const markRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markRead(req.params.id, req.user.id);
  res.json({ success: true, data: updated });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json({ success: true });
});

module.exports = { list, unreadCount, markRead, markAllRead };
