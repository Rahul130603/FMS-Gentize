const asyncHandler = require('../utils/asyncHandler');
const commentService = require('../services/commentService');
const queryService = require('../services/queryService');

const list = asyncHandler(async (req, res) => {
  await queryService.assertQueryExists(req.params.id);
  const comments = await commentService.listComments(req.params.id, req.user);
  res.json({ success: true, data: comments });
});

const create = asyncHandler(async (req, res) => {
  await queryService.assertQueryExists(req.params.id);
  const comment = await commentService.addComment(req.params.id, req.user, req.body);
  res.status(201).json({ success: true, message: 'Comment added', data: comment });
});

module.exports = { list, create };
