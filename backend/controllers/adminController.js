/**
 * Admin controller — admin portal (FR-11).
 * Owns user management, KYC queue, pricing, fraud queue, audit logs, reports.
 */

/**
 * Placeholder for the admin user-management listing (FR-11).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getUsers(req, res) {
  res.status(501).json({ message: 'Admin — not implemented yet (FR-11)' });
}

module.exports = { getUsers };
