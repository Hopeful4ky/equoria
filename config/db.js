const { Pool } = require('pg');

// Ensure .env variables are loaded. This is a safeguard;
// ideally, dotenv.config() is called at the earliest point in the application (e.g., index.js).
if (!process.env.DB_USER && require('fs').existsSync('../.env')) {
  console.warn(
    'db.js: .env file exists but environment variables like DB_USER are not loaded. Make sure dotenv.config() is called in your main entry file.'
  );
  // Attempt to load them if not already (though this is not ideal here)
  // require('dotenv').config({ path: '../.env' }); // Adjust path if necessary
}

console.log('--- DB Pool Creation --- ');
console.log('Using DB_USER:', process.env.DB_USER);
console.log('Using DB_HOST:', process.env.DB_HOST);
console.log('Using DB_DATABASE:', process.env.DB_DATABASE);
// Avoid logging password directly: console.log('Using DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not Set');
console.log('Using DB_PORT:', process.env.DB_PORT);
console.log('------------------------');

const pool = new Pool({
  user: process.env.DB_USER || 'your_db_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'horse_simulation_db',
  password: process.env.DB_PASSWORD || 'your_db_password',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  // It can be useful to export the pool itself for more complex transactions or direct access
  pool: pool,
};
