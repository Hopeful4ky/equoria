const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'horse_simulation_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function registerUser(username, email, password) {
  try {
    const checkResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkResult.rowCount > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_verified, game_currency) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
      [username, email, hashedPassword, false, 0]
    );

    return {
      id: insertResult.rows[0].id,
      username: insertResult.rows[0].username,
      email: insertResult.rows[0].email,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function loginUser(email, password) {
  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { user: { id: user.id, username: user.username, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    const user = await registerUser(username, email, password);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.use('/protected', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const payload = await verifyToken(token);
    req.user = payload.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  router,
};