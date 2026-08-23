/**
 * Review controller — per-transaction reviews (FR-04).
 * Owns creating and reading reviews attached to transactions.
 */

/**
 * Placeholder for listing reviews on a transaction (FR-04).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getReviews(req, res) {
  res.status(501).json({ message: 'Reviews — not implemented yet (FR-04)' });
}

module.exports = { getReviews };
