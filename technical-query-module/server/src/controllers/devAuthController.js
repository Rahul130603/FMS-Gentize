/**
 * Development/demo-only authentication.
 *
 * The real FMS already has its own login flow and attaches req.user
 * upstream (see middleware/auth.js). This controller exists purely so
 * the Technical Query module can be run and demoed standalone, and so
 * the seeded sample users can be used to exercise every role. It must
 * NOT be mounted when NODE_ENV === 'production' unless the host app
 * explicitly wants to delegate real login to it (not recommended).
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { query } = require('../config/db');
const env = require('../config/env');

const login = asyncHandler(async (req, res) => {
  const { employeeCode } = req.body;
  if (!employeeCode) throw ApiError.badRequest('employeeCode is required');

  const { rows } = await query(
    `SELECT u.id, u.employee_code, u.full_name, u.role, u.is_active, d.name AS department
     FROM users u LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.employee_code = $1`,
    [employeeCode]
  );
  const user = rows[0];
  if (!user || !user.is_active) throw ApiError.unauthorized('Unknown or inactive employee code');

  const payload = {
    id: user.id,
    name: user.full_name,
    role: user.role,
    department: user.department,
    employeeCode: user.employee_code,
  };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ success: true, data: { token, user: payload } });
});

const listDemoUsers = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT u.employee_code, u.full_name, u.role, d.name AS department
     FROM users u LEFT JOIN departments d ON d.id = u.department_id
     ORDER BY u.role DESC, u.full_name`
  );
  res.json({ success: true, data: rows });
});

module.exports = { login, listDemoUsers };
