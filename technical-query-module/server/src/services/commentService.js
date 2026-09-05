const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const auditService = require('./auditService');
const { isAdminRole } = require('../middleware/auth');

async function addComment(queryId, user, { comment, isInternal }) {
  if (isInternal && !isAdminRole(user.role)) {
    throw ApiError.forbidden('Only admins can add internal notes');
  }

  const { rows } = await query(
    `INSERT INTO technical_query_comments (query_id, user_id, user_name, user_role, comment, is_internal)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [queryId, user.id, user.name, user.role, comment, !!isInternal]
  );

  await auditService.logEvent(null, {
    queryId,
    actorId: user.id,
    actorName: user.name,
    eventType: 'comment_added',
    note: isInternal ? 'Added an internal note.' : 'Added a comment.',
  });

  return rows[0];
}

async function listComments(queryId, user) {
  const includeInternal = isAdminRole(user.role);
  const sql = includeInternal
    ? `SELECT * FROM technical_query_comments WHERE query_id = $1 ORDER BY created_at ASC`
    : `SELECT * FROM technical_query_comments WHERE query_id = $1 AND is_internal = false ORDER BY created_at ASC`;
  const { rows } = await query(sql, [queryId]);
  return rows;
}

module.exports = { addComment, listComments };
