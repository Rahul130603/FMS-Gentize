/**
 * Safely builds LIMIT/OFFSET/ORDER BY clauses from user-supplied query
 * params. Sort columns are restricted to an allowlist so this can never
 * be used to inject arbitrary SQL via `sortBy`.
 */
function buildPagination(query, { allowedSortColumns, defaultSort = 'created_at', defaultDir = 'desc' }) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize, 10) || 20, 1), 200);
  const offset = (page - 1) * pageSize;

  let sortBy = query.sortBy && allowedSortColumns.includes(query.sortBy) ? query.sortBy : defaultSort;
  let sortDir = (query.sortDir || defaultDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return {
    page,
    pageSize,
    offset,
    orderByClause: `ORDER BY ${sortBy} ${sortDir}`,
    limitClause: `LIMIT ${pageSize} OFFSET ${offset}`,
  };
}

function buildMeta({ page, pageSize, totalCount }) {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(Math.ceil(totalCount / pageSize), 1),
  };
}

module.exports = { buildPagination, buildMeta };
