/**
 * User controller — profiles & account security (FR-12).
 * Owns profile management, password reset, session/RBAC endpoints.
 */

/**
 * Placeholder for fetching the authenticated user's profile (FR-12).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getProfile(req, res) {
  res.status(501).json({ message: 'Users — not implemented yet (FR-12)' });
}

module.exports = { getProfile };
