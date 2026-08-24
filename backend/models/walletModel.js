/**
 * Wallet model — data access for wallets (D5 Wallets).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');

/**
 * Fetches a user's wallet with pending and available balances.
 *
 * @param {number} userId - The wallet owner's user id.
 * @returns {Promise<object|null>} The wallet row, or null if not found.
 */
// eslint-disable-next-line no-unused-vars
async function findByUser(userId) {
  throw new Error('Not implemented');
}

module.exports = { findByUser };
