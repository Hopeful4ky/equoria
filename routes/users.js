const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Import express-validator functions
const db = require('../config/db'); // Assuming db.js is in a config folder
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // JWT is not returned directly on signup anymore
const crypto = require('crypto'); // For generating verification token
const nodemailer = require('nodemailer'); // Require Nodemailer
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// Validation rules for user signup
const signupValidationRules = [
  body('username')
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters.')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches('[A-Z]')
    .withMessage('Password must contain at least one uppercase letter.')
    .matches('[0-9]')
    .withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/)
    .withMessage('Password must contain at least one special character.'),
];

// POST /api/users - User Signup
router.post('/', signupValidationRules, async (req, res, next) => {
  // Added validation rules as middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Send full errors array
  }

  const { username, email, password } = req.body;

  // Basic validation - REMOVED, handled by express-validator
  // if (!username || !email || !password) {
  //   return res.status(400).json({ message: 'Please provide username, email, and password' });
  // }

  // Password policy validation - REMOVED, handled by express-validator
  // if (password.length < 8) {
  //   return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  // }
  // ... (other password checks removed) ...

  try {
    // Check if user already exists
    const existingUserByUsername = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    if (existingUserByUsername.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' }); // Use 409 for conflict
    }

    const existingUserByEmail = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUserByEmail.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' }); // Use 409 for conflict
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Store new user with verification token
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, email_verification_token) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username, email, password_hash, emailVerificationToken]
    );

    const user = newUser.rows[0];

    // --- Email Sending Logic using Nodemailer + Ethereal ---
    try {
      // Create a test account with Ethereal for Nodemailer
      // We do this inside the try block for email sending because createTestAccount is async
      // For a production app, you'd configure a transporter once outside the request handler.
      let testAccount = await nodemailer.createTestAccount();

      // Create a transporter object using the Ethereal SMTP transport
      let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated Ethereal user
          pass: testAccount.pass, // generated Ethereal password
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });

      const verificationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/verify-email/${emailVerificationToken}`;

      // Send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"HorseSim Game No-Reply" <noreply@horsesim.example.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Verify Your Email Address for HorseSim Game', // Subject line
        text: `Hello ${user.username},\n\nPlease verify your email address by clicking the following link: ${verificationLink}\n\nIf you did not request this, please ignore this email.`, // plain text body
        html: `<p>Hello ${user.username},</p><p>Please verify your email address by clicking the link below:</p><a href="${verificationLink}">${verificationLink}</a><p>If you did not request this, please ignore this email.</p>`, // html body
      });

      console.log('Message sent: %s', info.messageId);
      // Preview URL will be logged to the console by Nodemailer
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      // Nodemailer will also output the preview URL to the console directly.
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Decide if this should be a fatal error for the signup or just logged.
      // For now, we'll let the signup succeed and just log the email error.
      // In production, you might want a more robust error handling/retry mechanism for emails.
    }
    // --- End Email Sending Logic ---

    res.status(201).json({
      message:
        'Registration successful. Please check your email (or Ethereal preview link in console) to verify your account.',
      userId: user.id, // Optionally return userId for client-side reference if needed
    });
  } catch (err) {
    console.error('Error during user signup:', err.stack || err);
    // Check for unique constraint errors from the DB as a fallback, though proactive checks are better
    if (err.constraint === 'users_username_key') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    if (err.constraint === 'users_email_key') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    next(err); // Pass to centralized error handler
  }
});

// GET /api/users/:id - Get User Profile (Protected Route)
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'User ID must be a number.' });
    }

    // At this point, req.user is populated by authMiddleware if the token was valid.
    // console.log('Authenticated user attempting to fetch profile:', req.user);
    // console.log(`Fetching profile for user ID: ${userId}`);

    // Authorization: Check if the authenticated user is requesting their own profile.
    // Later, we could add an admin role check here: e.g., && !req.user.isAdmin
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You can only view your own profile.' });
    }

    const result = await db.query(
      'SELECT id, username, email, is_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err.stack || err);
    next(err); // Pass to centralized error handler
  }
});

module.exports = router;
