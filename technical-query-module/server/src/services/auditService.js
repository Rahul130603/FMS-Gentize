const { query } = require('../config/db');

/**
 * Every mutating action on a technical query must leave a permanent,
 * append-only trail — this is the single place that happens so no
 * controller can accidentally skip it.
 */
async function logEvent(client, { queryId, actorId, actorName, eventType, oldStatus = null, newStatus = null, note = null, metadata = null }) {
  const runner = client || { query };
  const sql = `
    INSERT INTO technical_query_events
      (query_id, actor_id, actor_name, event_type, old_status, new_status, note, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`;
  const params = [queryId, actorId, actorName, eventType, oldStatus, newStatus, note, metadata ? JSON.stringify(metadata) : null];
  const { rows } = await runner.query(sql, params);
  return rows[0];
}

async function getTimeline(queryId) {
  const { rows } = await query(
    `SELECT id, query_id, actor_id, actor_name, event_type, old_status, new_status, note, metadata, created_at
     FROM technical_query_events WHERE query_id = $1 ORDER BY created_at ASC`,
    [queryId]
  );
  return rows;
}

module.exports = { logEvent, getTimeline };
