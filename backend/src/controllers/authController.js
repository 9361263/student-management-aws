const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Fallback demo users if DB is initializing
const DEMO_USERS = [
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@example.com',
    passwordHash: '$2a$10$E/Rkp.D1pnMYD.huTQyPqehh2rkC7rlF8i9IEyigRoYP00.ImZXqu', // Password@123
    role: 'ADMIN',
  },
  {
    id: 2,
    name: 'Dr. Ramesh Kumar (CSE HOD)',
    email: 'ramesh.cse@example.com',
    passwordHash: '$2a$10$E/Rkp.D1pnMYD.huTQyPqehh2rkC7rlF8i9IEyigRoYP00.ImZXqu', // Password@123
    role: 'FACULTY',
  },
  {
    id: 3,
    name: 'Prof. Priya Sharma (ECE)',
    email: 'priya.ece@example.com',
    passwordHash: '$2a$10$E/Rkp.D1pnMYD.huTQyPqehh2rkC7rlF8i9IEyigRoYP00.ImZXqu', // Password@123
    role: 'FACULTY',
  }
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    let user = null;

    try {
      const result = await query(
        'SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (dbErr) {
      console.warn('Database offline or unreachable, checking demo seed accounts:', dbErr.message);
      // Fallback check
      const demoMatch = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (demoMatch) {
        user = {
          id: demoMatch.id,
          name: demoMatch.name,
          email: demoMatch.email,
          password_hash: demoMatch.passwordHash,
          role: demoMatch.role,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'FACULTY' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, role.toUpperCase()]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to register user.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        user: req.user,
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      users: DEMO_USERS.map(({ passwordHash, ...rest }) => rest),
    });
  }
};

module.exports = {
  login,
  register,
  getMe,
  listUsers,
};
