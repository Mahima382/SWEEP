/**
 * Waste controller — listings, pickups, lots (FR-03, FR-05, FR-08).
 * Owns household listings, pickup management, and bulk lot aggregation.
 */

/**
 * Placeholder for listing waste listings / creating a listing with
 * category, photos (max 5), suggested price, and scheduling (FR-03).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getListings(req, res) {
  res.status(501).json({ message: 'Waste — not implemented yet (FR-03)' });
}

/**
 * Placeholder for pickup management: accept/decline, weight recording,
 * proof photos, bulk lot aggregation (FR-05).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function getPickups(req, res) {
  res.status(501).json({ message: 'Waste — not implemented yet (FR-05)' });
}

module.exports = { getListings, getPickups };
