const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/db');
const { CATEGORIES, PRIORITIES, STATUSES } = require('../validations/queryValidation');

/** Static + DB-backed lookup data the frontend needs for dropdowns/filters. */
const getLookups = asyncHandler(async (req, res) => {
  const [categories, priorities, statuses, admins, departments] = await Promise.all([
    query('SELECT code, label, sort_order FROM tq_categories WHERE is_active ORDER BY sort_order'),
    query('SELECT code, label, rank FROM tq_priorities ORDER BY rank'),
    query('SELECT code, label, color, sort_order, is_terminal FROM tq_statuses ORDER BY sort_order'),
    query(`SELECT id, full_name AS name, employee_code FROM users WHERE role IN ('admin','super_admin') AND is_active ORDER BY full_name`),
    query('SELECT id, name FROM departments ORDER BY name'),
  ]);

  res.json({
    success: true,
    data: {
      categories: categories.rows,
      priorities: priorities.rows,
      statuses: statuses.rows,
      admins: admins.rows,
      departments: departments.rows,
      // Fallback static lists (used only if the lookup tables are ever empty)
      fallback: { CATEGORIES, PRIORITIES, STATUSES },
    },
  });
});

const listEmployees = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.full_name AS name, u.employee_code, d.name AS department
     FROM users u LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.role = 'employee' AND u.is_active ORDER BY u.full_name`
  );
  res.json({ success: true, data: rows });
});

module.exports = { getLookups, listEmployees };
