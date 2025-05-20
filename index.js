require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`INCOMING REQUEST: ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  next();
});
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Routes
const userRoutes = require('./routes/users');
const { router: authRoutes } = require('./utils/auth');
const horseRoutes = require('./routes/horses');
const storeRoutes = require('./routes/store');
const breedingRoutes = require('./routes/breeding');
const breedingRequestRoutes = require('./routes/breedingRequests');
const bankRoutes = require('./routes/bank');

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
  app.use('/api/users', authLimiter, userRoutes);
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/horses', horseRoutes);
  app.use('/api/store', storeRoutes);
  app.use('/api/breeding', breedingRoutes);
  app.use('/api/breeding-requests', breedingRequestRoutes);
  app.use('/api/bank', bankRoutes);
} else {
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/horses', horseRoutes);
  app.use('/api/store', storeRoutes);
  app.use('/api/breeding', breedingRoutes);
  app.use('/api/breeding-requests', breedingRequestRoutes);
  app.use('/api/bank', bankRoutes);
}

// Root Route
app.get('/', (req, res) => {
  res.send('Hello World! Horse Simulation Backend is running.');
});

// Error Handling
app.use((err, req, res, _next) => {
  console.error('-----------------------------------------------------');
  console.error('Unhandled Error Caught by Central Error Handler:');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  if (req.body && Object.keys(req.body).length > 0) {
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
  }
  console.error('Error Stack:', err.stack);
  console.error('-----------------------------------------------------');

  if (process.env.NODE_ENV === 'production') {
    res.status(500).send('Internal Server Error');
  } else {
    res.status(500).json({
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
});

// Server and Scheduler
const { startHealthScheduler } = require('./utils/healthScheduler');
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    startHealthScheduler();
  });
}

module.exports = { app, server };