const cron = require('node-cron');
const db = require('../config/db');

// Function to calculate days between two dates
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Function to determine new health status
const determineNewHealthStatus = (daysSinceVetted) => {
  if (daysSinceVetted <= 7) return 'Excellent';
  if (daysSinceVetted <= 14) return 'Very Good';
  if (daysSinceVetted <= 21) return 'Good';
  if (daysSinceVetted <= 28) return 'Fair';
  return 'Poor';
};

const updateHorseHealth = async () => {
  console.log('Running weekly horse health update job...');
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: horses } = await client.query(
      'SELECT id, health_status, last_vetted_date FROM horses'
    );
    const today = new Date();
    let horsesUpdatedCount = 0;

    for (const horse of horses) {
      const daysSinceVetted = daysBetween(horse.last_vetted_date, today);
      const newHealthStatus = determineNewHealthStatus(daysSinceVetted);

      if (horse.health_status !== newHealthStatus) {
        await client.query(
          'UPDATE horses SET health_status = $1, updated_at = NOW() WHERE id = $2',
          [newHealthStatus, horse.id]
        );
        horsesUpdatedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(
      `Weekly horse health update completed. ${horsesUpdatedCount} horses updated.`
    );
  } catch (err) {
    console.error(
      '[CRITICAL] Error during weekly horse health update process:',
      err.stack || err.message || err
    );
    try {
      await client.query('ROLLBACK');
      console.log('Transaction rolled back due to error in health update.');
    } catch (rollbackErr) {
      console.error(
        '[CRITICAL-FATAL] Failed to ROLLBACK transaction after health update error:',
        rollbackErr.stack || rollbackErr.message || rollbackErr
      );
      // At this point, the DB connection might be in an unstable state.
      // Consider more drastic notifications here (e.g., admin email - TODO)
    }
    // TODO: Implement more robust notification for critical errors (e.g., email admin)
  } finally {
    client.release();
    console.log('Health update job finished and client released.');
  }
};

let healthUpdateJob = null; // Variable to store the cron job

// Schedule the task to run at midnight (00:00) every Sunday
// Cron expression: '0 0 * * 0' (At 00:00 on Sunday)
const startHealthScheduler = () => {
  // Prevent multiple schedulers if called again
  if (healthUpdateJob) {
    console.log(
      'Health scheduler potentially already initialized. Returning existing job or null.'
    );
    return healthUpdateJob;
  }

  healthUpdateJob = cron.schedule('0 0 * * 0', updateHorseHealth, {
    scheduled: true, // Job is created and started
    timezone: 'America/New_York',
  });
  console.log(
    'Horse health scheduler started. Will run every Sunday at midnight.'
  );
  return healthUpdateJob;
};

const stopHealthScheduler = () => {
  if (healthUpdateJob) {
    healthUpdateJob.stop();
    console.log('Horse health scheduler stopped.');
    healthUpdateJob = null; // Clear the reference to allow re-initialization if needed
  }
};

module.exports = {
  startHealthScheduler,
  updateHorseHealth,
  stopHealthScheduler,
  getHealthUpdateJob: () => healthUpdateJob,
};
