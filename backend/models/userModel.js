/**
 * User model — data access for the users table (D1 Users).
 * Model layer only: no Express imports, SQL via the shared SQLite connection.
 */

const db = require('../config/db');

/**
 * Finds a user by email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<object|null>} The user row, or null if not found.
 */
async function findByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return row || null;
}

/**
 * Creates a new user row.
 *
 * @param {object} user - User fields.
 * @param {string} user.role - One of household | collector | global | company | admin.
 * @param {string} user.fullName - Full name (or company name).
 * @param {string} user.email - Unique email address.
 * @param {string} user.mobile - Mobile number.
 * @param {string} user.passwordHash - Bcrypt password hash.
 * @param {string} user.status - Initial account status.
 * @returns {Promise<number>} The inserted user's id.
 */
async function create(user) {
  const result = db.prepare(`
    INSERT INTO users (role, full_name, email, mobile, password_hash, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(user.role, user.fullName, user.email, user.mobile, user.passwordHash, user.status);
  return Number(result.lastInsertRowid);
}

module.exports = { findByEmail, create };
