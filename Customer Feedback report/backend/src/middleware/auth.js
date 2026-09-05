const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fms_feedback_super_secret_jwt_key_2026';

function authenticate(req, res, next) {
  // Support Bearer token in Authorization header or custom x-user-role header for development ease
  const authHeader = req.headers.authorization;
  const devRoleHeader = req.headers['x-user-role'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
    }
  }

  // Fallback for development/testing if role header is passed
  if (devRoleHeader) {
    req.user = {
      id: devRoleHeader === 'ADMIN' ? 'usr_admin_1' : 'usr_emp_1',
      name: devRoleHeader === 'ADMIN' ? 'System Administrator' : 'John Developer',
      email: devRoleHeader === 'ADMIN' ? 'admin@fms.com' : 'developer@fms.com',
      role: devRoleHeader.toUpperCase()
    };
    return next();
  }

  // Default to ADMIN for open demo if not provided, or require auth
  // To strictly enforce security:
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please provide a valid Bearer token or login.'
  });
}

// Strict Role Guard: ONLY ADMIN
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Customer Feedback & Critic Reports are strictly restricted to Administrator personnel only. Employees do not have permission to view this module.'
    });
  }

  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  JWT_SECRET
};

