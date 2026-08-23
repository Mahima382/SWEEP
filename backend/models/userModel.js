/**
 * User model — data access for the users table (D1 Users).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');

/**
 * Finds a user by email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<object|null>} The user row, or null if not found.
 */
// eslint-disable-next-line no-unused-vars
async function findByEmail(email) {
  throw new Error('Not implemented');
}

/**
 * Creates a new user row.
 *
 * @param {object} user - User fields (role, name, email, passwordHash, nid, ...).
 * @returns {Promise<number>} The inserted user's id.
 */
// eslint-disable-next-line no-unused-vars
async function create(user) {
  throw new Error('Not implemented');
}

module.exports = { findByEmail, create };
