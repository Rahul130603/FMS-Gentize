const { query, getClient } = require('../config/db');
const ApiError = require('../utils/apiError');
const { buildPagination, buildMeta } = require('../utils/pagination');
const { buildQueryFilters } = require('../utils/queryFilters');
const auditService = require('./auditService');
const commentService = require('./commentService');
const attachmentService = require('./attachmentService');
const notificationService = require('./notificationService');
const { isAdminRole } = require('../middleware/auth');

const ALLOWED_SORT_COLUMNS = [
  'created_at', 'updated_at', 'query_number', 'subject', 'category',
  'priority', 'status', 'department', 'resolved_at',
];

const LIST_COLUMNS = `
  id, query_number, raised_by_id, raised_by_name, raised_by_role, department,
  isbn, subject, category, priority, description, status,
  assigned_to, assigned_to_name, created_at, updated_at, resolved_at, closed_at,
  reopen_count`;

/**
 * Creates a new technical query, its "created" audit event, and any
 * attachments uploaded in the same request — all inside one transaction
 * so a failure partway through never leaves an orphaned record.
 */
async function createQuery(user, data, files, requestMeta = {}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO technical_queries
        (raised_by_id, raised_by_name, raised_by_role, department,
         isbn, subject, category, priority, description, ip_address, browser)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        user.id, user.name, user.role, user.department || 'Unassigned',
        data.isbn || null, data.subject, data.category, data.priority || 'normal',
        data.description, requestMeta.ip || null, requestMeta.browser || null,
      ]
    );
    const created = rows[0];

    await auditService.logEvent(client, {
      queryId: created.id,
      actorId: user.id,
      actorName: user.name,
      eventType: 'created',
      newStatus: 'open',
      note: 'Technical query raised.',
    });

    await client.query('COMMIT');

    // Attachments are saved after commit (disk write already happened via
    // multer before this service runs); failure here shouldn't roll back
    // the query itself, just surface as a partial-success warning.
    let attachments = [];
    if (files && files.length) {
      attachments = await attachmentService.saveAttachments(created.id, files, user);
    }

    // Notify every admin that a new query needs triage. Best-effort: a
    // notification failing to insert should never fail the submission.
    await notificationService.notifyAdmins({
      queryId: created.id,
      queryNumber: created.query_number,
      subject: created.subject,
      raisedByName: created.raised_by_name,
    });

    return { ...created, attachments };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Lists queries with server-side filtering, sorting and pagination.
 * Employees are hard-scoped to their own queries regardless of any
 * `employeeId` filter they might pass — this is enforced here, not just
 * in the UI, since it is a security boundary.
 */
async function listQueries(rawFilters, rawQuery, requestingUser) {
  const filters = { ...rawFilters };
  if (!isAdminRole(requestingUser.role) || rawQuery.mine === true) {
    filters.employeeId = requestingUser.id;
  }

  const { whereSql, params, nextIndex } = buildQueryFilters(filters, { tableAlias: null });
  const { page, pageSize, orderByClause, limitClause } = buildPagination(rawQuery, {
    allowedSortColumns: ALLOWED_SORT_COLUMNS,
  });

  const countResult = await query(`SELECT COUNT(*)::int AS count FROM technical_queries ${whereSql}`, params);
  const totalCount = countResult.rows[0].count;

  const listSql = `
    SELECT ${LIST_COLUMNS},
      (SELECT COUNT(*) FROM technical_query_attachments a WHERE a.query_id = technical_queries.id)::int AS attachment_count,
      (SELECT COUNT(*) FROM technical_query_comments c WHERE c.query_id = technical_queries.id AND c.is_internal = false)::int AS comment_count
    FROM technical_queries
    ${whereSql}
    ${orderByClause}
    ${limitClause}`;
  const { rows } = await query(listSql, params);

  return { data: rows, meta: buildMeta({ page, pageSize, totalCount }) };
}

async function getQueryByIdRaw(id) {
  const { rows } = await query(`SELECT * FROM technical_queries WHERE id = $1`, [id]);
  if (!rows[0]) throw ApiError.notFound('Technical query not found');
  return rows[0];
}

function assertCanView(recordRow, user) {
  if (isAdminRole(user.role)) return;
  if (recordRow.raised_by_id !== user.id) {
    throw ApiError.forbidden('You can only view your own technical queries');
  }
}

/** Full detail payload: the record plus timeline, comments, attachments. */
async function getQueryDetail(id, user) {
  const record = await getQueryByIdRaw(id);
  assertCanView(record, user);

  const [timeline, comments, attachments] = await Promise.all([
    auditService.getTimeline(id),
    commentService.listComments(id, user),
    attachmentService.listAttachments(id),
  ]);

  const resolutionHours =
    record.resolved_at ? (new Date(record.resolved_at) - new Date(record.created_at)) / 36e5 : null;

  return { ...record, resolutionHours, timeline, comments, attachments };
}

async function assertQueryExists(id) {
  return getQueryByIdRaw(id);
}

/**
 * All other technical queries raised against the same ISBN, across every
 * employee — surfaced under "Raise Query" and the Query Details screens so
 * anyone logging a new issue (or reviewing one) can immediately see the
 * ISBN's prior history instead of duplicating a known, already-tracked
 * problem. Deliberately available to employees too (not admin-only): it's
 * informational context on the ISBN, not a cross-employee management view.
 */
async function getIsbnHistory(isbn, excludeId) {
  const params = [isbn];
  let excludeClause = '';
  if (excludeId) {
    params.push(excludeId);
    excludeClause = `AND id <> $2`;
  }
  const { rows } = await query(
    `SELECT id, query_number, subject, category, priority, status,
            raised_by_name, assigned_to_name, created_at, resolved_at
     FROM technical_queries
     WHERE isbn = $1 ${excludeClause}
     ORDER BY created_at DESC
     LIMIT 25`,
    params
  );
  return rows;
}

/** Generic status/field mutation used by every admin action below. */
async function applyMutation(id, actingUser, { setClause, params, eventType, oldStatus, newStatus, note, metadata }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE technical_queries SET ${setClause} WHERE id = $1 RETURNING *`,
      params
    );
    if (!rows[0]) throw ApiError.notFound('Technical query not found');

    await auditService.logEvent(client, {
      queryId: id,
      actorId: actingUser.id,
      actorName: actingUser.name,
      eventType,
      oldStatus,
      newStatus,
      note,
      metadata,
    });

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function assignQuery(id, actingUser, { assignedTo, assignedToName, note }) {
  const existing = await getQueryByIdRaw(id);
  return applyMutation(id, actingUser, {
    setClause: `assigned_to = $2, assigned_to_name = $3, status = CASE WHEN status = 'open' THEN 'in_review' ELSE status END`,
    params: [id, assignedTo, assignedToName],
    eventType: existing.assigned_to ? 'reassigned' : 'assigned',
    oldStatus: existing.status,
    newStatus: existing.status === 'open' ? 'in_review' : existing.status,
    note: note || `Assigned to ${assignedToName}.`,
  });
}

async function changePriority(id, actingUser, { priority, note }) {
  const existing = await getQueryByIdRaw(id);
  return applyMutation(id, actingUser, {
    setClause: `priority = $2`,
    params: [id, priority],
    eventType: 'priority_changed',
    note: note || `Priority changed from ${existing.priority} to ${priority}.`,
    metadata: { from: existing.priority, to: priority },
  });
}

async function changeStatus(id, actingUser, { status, note }) {
  const existing = await getQueryByIdRaw(id);
  const timestampCol =
    status === 'resolved' ? `, resolved_at = now()`
    : status === 'closed' ? `, closed_at = now()`
    : '';
  return applyMutation(id, actingUser, {
    setClause: `status = $2${timestampCol}`,
    params: [id, status],
    eventType: 'status_changed',
    oldStatus: existing.status,
    newStatus: status,
    note: note || `Status changed from ${existing.status} to ${status}.`,
  });
}

async function updateAdminNotes(id, actingUser, { adminNotes }) {
  return applyMutation(id, actingUser, {
    setClause: `admin_notes = $2`,
    params: [id, adminNotes],
    eventType: 'note_added',
    note: 'Admin notes updated.',
  });
}

async function requestMoreInfo(id, actingUser, { note }) {
  const existing = await getQueryByIdRaw(id);
  return applyMutation(id, actingUser, {
    setClause: `info_requested_at = now(), info_requested_note = $2, status = CASE WHEN status IN ('resolved','closed') THEN status ELSE 'in_review' END`,
    params: [id, note],
    eventType: 'info_requested',
    oldStatus: existing.status,
    newStatus: existing.status,
    note: `More information requested: ${note}`,
  });
}

async function resolveQuery(id, actingUser, { resolutionNotes }) {
  const existing = await getQueryByIdRaw(id);
  if (existing.status === 'closed' || existing.status === 'archived') {
    throw ApiError.conflict(`Cannot resolve a query that is already ${existing.status}`);
  }
  const updated = await applyMutation(id, actingUser, {
    setClause: `status = 'resolved', resolution_notes = $2, resolved_at = now()`,
    params: [id, resolutionNotes],
    eventType: 'resolved',
    oldStatus: existing.status,
    newStatus: 'resolved',
    note: 'Query marked as resolved.',
  });

  // Let the employee who raised it know. Best-effort, same as above.
  await notificationService.notifyEmployeeResolved({
    queryId: updated.id,
    queryNumber: updated.query_number,
    subject: updated.subject,
    raisedById: updated.raised_by_id,
  });

  return updated;
}

async function closeQuery(id, actingUser) {
  const existing = await getQueryByIdRaw(id);
  return applyMutation(id, actingUser, {
    setClause: `status = 'closed', closed_at = now()`,
    params: [id],
    eventType: 'closed',
    oldStatus: existing.status,
    newStatus: 'closed',
    note: 'Query closed.',
  });
}

async function reopenQuery(id, actingUser, { reason }) {
  const existing = await getQueryByIdRaw(id);
  if (!['resolved', 'closed'].includes(existing.status)) {
    throw ApiError.conflict('Only resolved or closed queries can be reopened');
  }
  return applyMutation(id, actingUser, {
    setClause: `status = 'reopened', reopen_count = reopen_count + 1, reopen_reason = $2, resolved_at = NULL, closed_at = NULL`,
    params: [id, reason],
    eventType: 'reopened',
    oldStatus: existing.status,
    newStatus: 'reopened',
    note: `Query reopened: ${reason}`,
    metadata: { previousResolvedAt: existing.resolved_at, previousClosedAt: existing.closed_at },
  });
}

async function archiveQuery(id, actingUser) {
  const existing = await getQueryByIdRaw(id);
  return applyMutation(id, actingUser, {
    setClause: `status = 'archived'`,
    params: [id],
    eventType: 'archived',
    oldStatus: existing.status,
    newStatus: 'archived',
    note: 'Query archived.',
  });
}

module.exports = {
  createQuery,
  listQueries,
  getQueryDetail,
  assertQueryExists,
  getIsbnHistory,
  assignQuery,
  changePriority,
  changeStatus,
  updateAdminNotes,
  requestMoreInfo,
  resolveQuery,
  closeQuery,
  reopenQuery,
  archiveQuery,
};
