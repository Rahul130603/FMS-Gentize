/**
 * Shared WHERE-clause builder for technical_queries. Used by both the
 * list endpoint and every report endpoint so filtering behaves
 * identically everywhere (a report and its underlying grid must always
 * agree on what "filtered results" means).
 *
 * Returns { whereSql, params } — whereSql already includes the leading
 * "WHERE" keyword (or is empty if there are no filters).
 */
function buildQueryFilters(filters = {}, { tableAlias = 'tq', startParamIndex = 1 } = {}) {
  const clauses = [];
  const params = [];
  let i = startParamIndex;
  const alias = tableAlias ? `${tableAlias}.` : '';

  const push = (clause, value) => {
    clauses.push(clause.replace('$$', `$${i}`));
    params.push(value);
    i += 1;
  };

  if (filters.status) push(`${alias}status = $$`, filters.status);
  if (filters.statuses && filters.statuses.length) {
    clauses.push(`${alias}status = ANY($${i}::text[])`);
    params.push(filters.statuses);
    i += 1;
  }
  if (filters.priority) push(`${alias}priority = $$`, filters.priority);
  if (filters.category) push(`${alias}category = $$`, filters.category);
  if (filters.department) push(`${alias}department = $$`, filters.department);
  if (filters.isbn) push(`${alias}isbn ILIKE $$`, `%${filters.isbn}%`);
  if (filters.employeeId) push(`${alias}raised_by_id = $$`, filters.employeeId);
  if (filters.adminId) push(`${alias}assigned_to = $$`, filters.adminId);
  if (filters.role) push(`${alias}raised_by_role = $$`, filters.role);
  if (filters.year) push(`EXTRACT(YEAR FROM ${alias}created_at) = $$`, filters.year);
  if (filters.month) push(`EXTRACT(MONTH FROM ${alias}created_at) = $$`, filters.month);
  if (filters.dateFrom) push(`${alias}created_at >= $$`, filters.dateFrom);
  if (filters.dateTo) push(`${alias}created_at <= $$`, filters.dateTo);
  if (filters.excludeArchived) clauses.push(`${alias}status <> 'archived'`);

  if (filters.search) {
    clauses.push(
      `(${alias}search_vector @@ plainto_tsquery('english', $${i}) OR ${alias}query_number ILIKE $${i + 1} OR ${alias}isbn ILIKE $${i + 1})`
    );
    params.push(filters.search, `%${filters.search}%`);
    i += 2;
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereSql, params, nextIndex: i };
}

module.exports = { buildQueryFilters };
