/**
 * Transaction model — data access for payment transactions (D7 Transactions).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');

/**
 * Finds transactions for a wallet.
 *
 * @param {number} walletId - The wallet's id.
 * @returns {Promise<object[]>} The wallet's transaction history.
 */
// eslint-disable-next-line no-unused-vars
async function findByWallet(walletId) {
  throw new Error('Not implemented');
}

module.exports = { findByWallet };
