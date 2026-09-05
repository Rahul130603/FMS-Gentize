const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const searchService = require('../services/searchService');

const search = asyncHandler(async (req, res) => {
  const term = (req.query.q || '').trim();
  if (term.length < 2) throw ApiError.badRequest('Search term must be at least 2 characters');
  const result = await searchService.globalSearch(term, req.query, req.query);
  res.json({ success: true, ...result });
});

module.exports = { search };
