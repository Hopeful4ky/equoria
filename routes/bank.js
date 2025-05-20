const express = require('express');
const router = express.Router();
const db = require('../config/db'); // db.pool is available for transactions
const authMiddleware = require('../middleware/authMiddleware');

const BASIC_STIPEND = 2500;
const PREMIUM_STIPEND = 7500;

// Helper function to determine the start of the week (Sunday) for a given date
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// @route   POST api/bank/visit
// @desc    Allow user to collect weekly stipend from the bank
// @access  Private
router.post('/visit', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const client = await db.pool.connect(); // Get a client from the pool

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Fetch user details (use FOR UPDATE to lock the row if necessary, though less critical here than in breeding)
    const userResult = await client.query(
      'SELECT user_type, last_bank_visit, game_currency FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'User not found.' });
    }

    const user = userResult.rows[0];
    const now = new Date();

    // 2. Check cooldown
    if (user.last_bank_visit) {
      const lastVisitDate = new Date(user.last_bank_visit);
      const startOfThisWeek = getStartOfWeek(now);
      const startOfLastVisitWeek = getStartOfWeek(lastVisitDate);

      // Normalize to midnight to compare dates only
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfLastVisitWeek.setHours(0, 0, 0, 0);

      if (startOfThisWeek.getTime() <= startOfLastVisitWeek.getTime()) {
        await client.query('ROLLBACK');
        // Calculate next eligible visit time (start of next week)
        const nextEligibleDate = new Date(startOfLastVisitWeek);
        nextEligibleDate.setDate(startOfLastVisitWeek.getDate() + 7);
        nextEligibleDate.setHours(0, 0, 0, 0);
        return res.status(400).json({
          msg: 'You have already visited the bank this week.',
          nextEligibleVisit: nextEligibleDate.toDateString(), // Provide more user-friendly date
        });
      }
    }

    // 3. Determine stipend amount
    let stipendAmount = 0;
    if (user.user_type === 'premium') {
      stipendAmount = PREMIUM_STIPEND;
    } else {
      // 'basic' or any other unforeseen type defaults to basic
      stipendAmount = BASIC_STIPEND;
    }

    // 4. Update user's currency and last_bank_visit
    const newCurrency = (user.game_currency || 0) + stipendAmount;
    const updateResult = await client.query(
      'UPDATE users SET game_currency = $1, last_bank_visit = $2, updated_at = NOW() WHERE id = $3 RETURNING game_currency',
      [newCurrency, now, userId]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({ msg: 'Failed to update user bank details.' });
    }

    await client.query('COMMIT'); // Commit transaction
    res.json({
      msg: `Successfully collected weekly stipend of ${stipendAmount}.`,
      newBalance: updateResult.rows[0].game_currency, // Use returned currency for accuracy
      stipendReceived: stipendAmount,
    });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any error
    console.error('Error visiting bank (transaction):', err.stack || err);
    res
      .status(500)
      .send('Server Error: Bank visit failed and was rolled back.');
  } finally {
    client.release(); // Release client back to the pool
  }
});

module.exports = router;
