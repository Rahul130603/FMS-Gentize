const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password, role } = req.body;

      // Allow quick role-based demo selection if provided
      if (role && (role === 'ADMIN' || role === 'EMPLOYEE')) {
        const user = await db.get('SELECT id, name, email, role FROM users WHERE role = ? LIMIT 1', [role]);
        if (user) {
          const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            token,
            user
          });
        }
      }

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({ success: true, user: req.user });
  }
}

module.exports = AuthController;

