/**
 * Order model — data access for fixed-price orders (D4 Orders).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');

/**
 * Finds orders placed by a company.
 *
 * @param {number} companyId - The company user's id.
 * @returns {Promise<object[]>} The company's orders.
 */
// eslint-disable-next-line no-unused-vars
async function findByCompany(companyId) {
  throw new Error('Not implemented');
}

module.exports = { findByCompany };
