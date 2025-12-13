const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../database/setup');
const { signToken } = require('../middleware/auth');
const { registerValidator, loginValidator } = require("../validators/authValidators");
const validate = require("../middleware/validate");

const router = express.Router();

// POST /api/register
router.post('/register', registerValidator, validate, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Validate role
    const userRole = role && ['dm', 'player'].includes(role) ? role : 'player';

    // Check if user exists
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ username, password: hash, role: userRole });

    // Generate JWT token
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });

    // Error handler
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/login
router.post('/login', loginValidator, validate, async (req, res) => {
  try {

    // Validate input
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } 
    // Error handler
    catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;