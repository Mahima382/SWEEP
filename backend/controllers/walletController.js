/**
 * Wallet controller — earnings & balances (FR-04, FR-06).
 * Owns household wallet and collector earnings dashboards.
 */

/**
 * Placeholder for wallet balance/breakdown: pending vs available,
 * withdrawal, CSV/PDF export (FR-04, FR-06).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getWallet(req, res) {
  res.status(501).json({ message: 'Wallet — not implemented yet (FR-04)' });
}

module.exports = { getWallet };
