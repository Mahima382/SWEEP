/**
 * Waste model — data access for listings and pickups (D2 Listings, D3 Pickups).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');

/**
 * Finds waste listings for a household.
 *
 * @param {number} householdId - The household user's id.
 * @returns {Promise<object[]>} The household's listings.
 */
// eslint-disable-next-line no-unused-vars
async function findByHousehold(householdId) {
  throw new Error('Not implemented');
}

/**
 * Creates a new waste listing.
 *
 * @param {object} listing - Listing fields (category, weight, photos, suggestedPrice, ...).
 * @returns {Promise<number>} The inserted listing's id.
 */
// eslint-disable-next-line no-unused-vars
async function create(listing) {
  throw new Error('Not implemented');
}

module.exports = { findByHousehold, create };
