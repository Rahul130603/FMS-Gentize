const { query } = require('../config/db');
const { buildQueryFilters } = require('../utils/queryFilters');
const { buildPagination, buildMeta } = require('../utils/pagination');

const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'query_number', 'subject', 'status', 'priority'];

// Delimiters ts_headline wraps matched terms with, in place of the default
// <b>/</b> tags. These are fixed constants we control (not user input),
// baked directly into the SQL text below, so no extra bind parameters are
// needed. The frontend splits the returned snippet on these exact markers
// to render a highlight safely as plain React text nodes, instead of using
// dangerouslySetInnerHTML on user-authored content — which could otherwise
// let a stored-XSS payload in a query description reach every admin who
// searches for it.
const HL_START = '';
const HL_END = '';

/**
 * Global search across query number, ISBN, employee, subject,
 * description, category, admin name, comments and resolution notes —
 * i.e. everything the "Search Engine" section of the spec calls for.
 * Designed to keep working correctly even against a table with years
 * of accumulated history (search_vector + trigram indexes keep it fast).
 */
async function globalSearch(term, extraFilters = {}, paginationQuery = {}) {
  const { whereSql: extraWhere, params: extraParams } = buildQueryFilters(extraFilters, {
    tableAlias: 'tq',
    startParamIndex: 3,
  });

  const searchClause = `
    (
      tq.search_vector @@ plainto_tsquery('english', $1)
      OR tq.query_number ILIKE $2
      OR tq.isbn ILIKE $2
      OR tq.raised_by_name ILIKE $2
      OR tq.assigned_to_name ILIKE $2
      OR EXISTS (
        SELECT 1 FROM technical_query_comments c
        WHERE c.query_id = tq.id AND c.comment ILIKE $2
      )
    )`;

  const whereSql = extraWhere
    ? `WHERE ${searchClause} AND ${extraWhere.replace('WHERE ', '')}`
    : `WHERE ${searchClause}`;

  const params = [term, `%${term}%`, ...extraParams];

  const { page, pageSize, orderByClause, limitClause } = buildPagination(paginationQuery, {
    allowedSortColumns: ALLOWED_SORT_COLUMNS,
  });

  const countSql = `SELECT COUNT(*)::int AS count FROM technical_queries tq ${whereSql}`;
  const countResult = await query(countSql, params);

  const listSql = `
    SELECT tq.id, tq.query_number, tq.subject, tq.isbn, tq.category, tq.priority, tq.status,
           tq.raised_by_name, tq.assigned_to_name, tq.department, tq.created_at, tq.updated_at,
           ts_headline(
             'english', coalesce(tq.description, ''), plainto_tsquery('english', $1),
             E'MaxFragments=1, MaxWords=25, MinWords=10, StartSel=\\x01, StopSel=\\x02'
           ) AS snippet
    FROM technical_queries tq
    ${whereSql}
    ${orderByClause.replace(/(\bcreated_at\b|\bupdated_at\b|\bquery_number\b|\bsubject\b|\bstatus\b|\bpriority\b)/, 'tq.$1')}
    ${limitClause}`;
  const { rows } = await query(listSql, params);

  const data = rows.map((row) => ({ ...row, snippet: row.snippet ?? null }));

  return { data, meta: buildMeta({ page, pageSize, totalCount: countResult.rows[0].count }) };
}

module.exports = { globalSearch, HL_START, HL_END };
