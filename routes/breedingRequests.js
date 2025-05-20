const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/breeding-requests
// @desc    Create a breeding request to a private stud
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { mare_id, stallion_id } = req.body;
  const mare_owner_id = req.user.id;

  if (!mare_id || !stallion_id) {
    return res
      .status(400)
      .json({ msg: 'Mare ID and Stallion ID are required.' });
  }
  if (isNaN(parseInt(mare_id)) || isNaN(parseInt(stallion_id))) {
    return res
      .status(400)
      .json({ msg: 'Mare ID and Stallion ID must be valid numbers.' });
  }
  const num_mare_id = parseInt(mare_id);
  const num_stallion_id = parseInt(stallion_id);

  try {
    // 1. Fetch mare details (ensure it's a mare and owned by the requester)
    const mareResult = await db.query(
      'SELECT * FROM horses WHERE id = $1 AND owner_id = $2 AND sex = $3',
      [num_mare_id, mare_owner_id, 'Mare']
    );
    if (mareResult.rows.length === 0) {
      return res
        .status(404)
        .json({ msg: 'Mare not found, not owned by you, or is not a Mare.' });
    }
    // const mare = mareResult.rows[0]; // mare object not strictly needed for this operation if just creating request

    // 2. Fetch stallion details (ensure it's a stallion, private stud, and get owner_id and stud_fee)
    const stallionResult = await db.query(
      'SELECT owner_id, stud_fee, stud_status FROM horses WHERE id = $1 AND sex = $2',
      [num_stallion_id, 'Stallion']
    );
    if (stallionResult.rows.length === 0) {
      return res
        .status(404)
        .json({ msg: 'Stallion not found or is not a Stallion.' });
    }
    const stallion = stallionResult.rows[0];

    if (stallion.stud_status !== 'Private Stud') {
      return res
        .status(400)
        .json({ msg: 'This stallion is not listed for Private Stud.' });
    }

    if (stallion.owner_id === mare_owner_id) {
      return res
        .status(400)
        .json({
          msg: 'You cannot send a breeding request to your own stallion through this system.',
        });
    }

    // 3. Check for existing pending/accepted request for this pair from this mare owner
    const existingRequestResult = await db.query(
      'SELECT * FROM breeding_requests WHERE mare_id = $1 AND stallion_id = $2 AND mare_owner_id = $3 AND (status = $4 OR status = $5)',
      [num_mare_id, num_stallion_id, mare_owner_id, 'pending', 'accepted']
    );
    if (existingRequestResult.rows.length > 0) {
      return res
        .status(400)
        .json({
          msg: 'An active breeding request for this mare and stallion already exists.',
        });
    }

    // 4. Create the breeding request
    const stud_fee_at_request = stallion.stud_fee;
    const newRequestQuery = `
            INSERT INTO breeding_requests (mare_id, stallion_id, mare_owner_id, stallion_owner_id, stud_fee_at_request, status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
    const newRequestParams = [
      num_mare_id,
      num_stallion_id,
      mare_owner_id,
      stallion.owner_id,
      stud_fee_at_request,
      'pending',
    ];

    const newRequestResult = await db.query(newRequestQuery, newRequestParams);

    res.status(201).json(newRequestResult.rows[0]);
  } catch (err) {
    console.error('Error creating breeding request:', err.stack || err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/breeding-requests/received
// @desc    Get breeding requests received by the user (for their stallions)
// @access  Private
router.get('/received', authMiddleware, async (req, res) => {
  const stallion_owner_id = req.user.id;
  try {
    // Fetches requests where the current user is the stallion owner.
    // Joins with horses table to get mare and stallion names for display.
    const requestsResult = await db.query(
      `
            SELECT 
                br.*, 
                m.name as mare_name, 
                s.name as stallion_name,
                u_mare.username as mare_owner_username
            FROM breeding_requests br
            JOIN horses m ON br.mare_id = m.id
            JOIN horses s ON br.stallion_id = s.id
            JOIN users u_mare ON br.mare_owner_id = u_mare.id
            WHERE br.stallion_owner_id = $1
            ORDER BY br.created_at DESC;
        `,
      [stallion_owner_id]
    );

    res.json(requestsResult.rows);
  } catch (err) {
    console.error(
      'Error fetching received breeding requests:',
      err.stack || err
    );
    res.status(500).send('Server Error');
  }
});

// @route   GET api/breeding-requests/sent
// @desc    Get breeding requests sent by the user (for their mares)
// @access  Private
router.get('/sent', authMiddleware, async (req, res) => {
  const mare_owner_id = req.user.id;
  try {
    // Fetches requests where the current user is the mare owner.
    // Joins with horses table to get mare and stallion names for display.
    const requestsResult = await db.query(
      `
            SELECT 
                br.*, 
                m.name as mare_name, 
                s.name as stallion_name,
                u_stallion.username as stallion_owner_username
            FROM breeding_requests br
            JOIN horses m ON br.mare_id = m.id
            JOIN horses s ON br.stallion_id = s.id
            JOIN users u_stallion ON br.stallion_owner_id = u_stallion.id
            WHERE br.mare_owner_id = $1
            ORDER BY br.created_at DESC;
        `,
      [mare_owner_id]
    );

    res.json(requestsResult.rows);
  } catch (err) {
    console.error('Error fetching sent breeding requests:', err.stack || err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/breeding-requests/:requestId/accept
// @desc    Accept a breeding request (stallion owner)
// @access  Private
router.put('/:requestId/accept', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  const stallion_owner_id = req.user.id;

  const num_requestId = parseInt(requestId);
  if (isNaN(num_requestId)) {
    return res.status(400).json({ msg: 'Request ID must be a valid number.' });
  }

  try {
    const requestResult = await db.query(
      'SELECT * FROM breeding_requests WHERE id = $1 AND stallion_owner_id = $2 AND status = $3',
      [num_requestId, stallion_owner_id, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          msg: 'Pending request not found or you are not authorized to accept it.',
        });
    }

    const updatedRequest = await db.query(
      'UPDATE breeding_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['accepted', num_requestId]
    );

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    console.error('Error accepting breeding request:', err.stack || err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/breeding-requests/:requestId/reject
// @desc    Reject a breeding request (stallion owner)
// @access  Private
router.put('/:requestId/reject', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  const stallion_owner_id = req.user.id;

  const num_requestId = parseInt(requestId);
  if (isNaN(num_requestId)) {
    return res.status(400).json({ msg: 'Request ID must be a valid number.' });
  }

  try {
    const requestResult = await db.query(
      'SELECT * FROM breeding_requests WHERE id = $1 AND stallion_owner_id = $2 AND status = $3',
      [num_requestId, stallion_owner_id, 'pending'] // Can only reject pending requests
    );

    if (requestResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          msg: 'Pending request not found or you are not authorized to reject it.',
        });
    }

    const updatedRequest = await db.query(
      'UPDATE breeding_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['rejected', num_requestId]
    );

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    console.error('Error rejecting breeding request:', err.stack || err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/breeding-requests/:requestId/cancel
// @desc    Cancel a sent breeding request (mare owner)
// @access  Private
router.put('/:requestId/cancel', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  const mare_owner_id = req.user.id;

  const num_requestId = parseInt(requestId);
  if (isNaN(num_requestId)) {
    return res.status(400).json({ msg: 'Request ID must be a valid number.' });
  }

  try {
    const requestResult = await db.query(
      'SELECT * FROM breeding_requests WHERE id = $1 AND mare_owner_id = $2 AND status = $3',
      [num_requestId, mare_owner_id, 'pending'] // Can only cancel pending requests
    );

    if (requestResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          msg: 'Pending request not found or you are not authorized to cancel it.',
        });
    }

    const updatedRequest = await db.query(
      'UPDATE breeding_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled_by_mare_owner', num_requestId]
    );

    res.json(updatedRequest.rows[0]);
  } catch (err) {
    console.error('Error cancelling breeding request:', err.stack || err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
