const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * authenticate
 * ------------
 * Integration point with the existing FMS.
 *
 * Most FMS installs already authenticate the request upstream (session
 * cookie, SSO, or their own JWT middleware) and attach something like
 * `req.user = { id, name, role, department }` before this module's
 * routers ever run. When that's the case, this middleware is a no-op
 * pass-through — it detects `req.user` and simply validates its shape.
 *
 * For standalone running/demo purposes (and as a safety net), it also
 * knows how to verify its own bearer JWT and populate req.user from it.
 */
function authenticate(req, res, next) {
  if (req.user && req.user.id) {
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      employeeCode: payload.employeeCode,
    };
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired session'));
  }
}

/**
 * authorize(...roles)
 * Restricts a route to specific roles. Pass no roles to only require
 * that the user is authenticated.
 *
 * Roles used throughout this module: 'employee', 'admin', 'super_admin'.
 * 'admin' and 'super_admin' are treated as "admin-capable" everywhere
 * except a couple of super-admin-only actions (e.g. hard archive).
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (roles.length === 0) return next();
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('This action requires a different role'));
    }
    return next();
  };
}

const isAdminRole = (role) => role === 'admin' || role === 'super_admin';

function requireAdmin(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (!isAdminRole(req.user.role)) {
    return next(ApiError.forbidden('Admin access required'));
  }
  return next();
}

module.exports = { authenticate, authorize, requireAdmin, isAdminRole };
