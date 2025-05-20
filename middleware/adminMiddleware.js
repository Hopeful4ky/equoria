// This middleware should be placed *after* authMiddleware
const adminMiddleware = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ msg: 'No user authenticated, admin access denied.' });
  }

  try {
    // Option 1: If user object from authMiddleware already contains the role
    // (e.g., if JWT payload includes role or authMiddleware fetches full user)
    if (req.user.role === 'admin') {
      next();
    } else {
      return res
        .status(403)
        .json({ msg: 'User is not an admin, access denied.' });
    }

    // Option 2: If user object from authMiddleware only contains id, and we need to fetch the role
    // This depends on how authMiddleware is structured. Let's assume authMiddleware populates req.user fully for now.
    // If not, we would do:
    // const userResult = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    // if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
    //     next();
    // } else {
    //     return res.status(403).json({ msg: 'User is not an admin, access denied.' });
    // }
  } catch (err) {
    console.error('Error in adminMiddleware:', err.message);
    res.status(500).send('Server Error during admin authorization');
  }
};

module.exports = adminMiddleware;
