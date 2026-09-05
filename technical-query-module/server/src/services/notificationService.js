const { query } = require('../config/db');

/**
 * In-app notifications: admins are notified when a new query is raised;
 * the employee who raised a query is notified when it's resolved. Fired
 * after the triggering mutation has already committed (same pattern the
 * service layer uses for attachments) — a notification failing to insert
 * should never roll back the underlying query change.
 */
async function notifyAdmins({ queryId, queryNumber, subject, raisedByName }) {
  const { rows: admins } = await query(
    `SELECT id FROM users WHERE role IN ('admin','super_admin') AND is_active`
  );
  if (!admins.length) return;

  const message = `${raisedByName} raised a new technical query ${queryNumber}: ${subject}`;
  const values = [];
  const params = [];
  admins.forEach((admin, i) => {
    const base = i * 4;
    values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
    params.push(admin.id, queryId, 'query_raised', message);
  });

  await query(
    `INSERT INTO technical_query_notifications (user_id, query_id, type, message) VALUES ${values.join(', ')}`,
    params
  );
}

async function notifyEmployeeResolved({ queryId, queryNumber, subject, raisedById }) {
  const message = `Your technical query ${queryNumber} ("${subject}") has been resolved.`;
  await query(
    `INSERT INTO technical_query_notifications (user_id, query_id, type, message)
     VALUES ($1, $2, 'query_resolved', $3)`,
    [raisedById, queryId, message]
  );
}

async function listForUser(userId, { limit = 20 } = {}) {
  const { rows } = await query(
    `SELECT n.id, n.query_id, n.type, n.message, n.is_read, n.created_at, tq.query_number
     FROM technical_query_notifications n
     JOIN technical_queries tq ON tq.id = n.query_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function unreadCount(userId) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM technical_query_notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return rows[0].count;
}

async function markRead(id, userId) {
  const { rows } = await query(
    `UPDATE technical_query_notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0];
}

async function markAllRead(userId) {
  await query(
    `UPDATE technical_query_notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
}

module.exports = { notifyAdmins, notifyEmployeeResolved, listForUser, unreadCount, markRead, markAllRead };
