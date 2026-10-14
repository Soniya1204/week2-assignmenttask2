const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
};

// @route POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;

    try {
      const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'Email or username already exists' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

      sendTokenResponse({ id: result.insertId, username, email }, 201, res);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      sendTokenResponse(user, 200, res);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;