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

/** Failed attempts at which an account is locked (NFR login lockout, FR-02). */
const LOCKOUT_THRESHOLD = 5;
/** Lockout duration in milliseconds (15 minutes, NFR login lockout, FR-02). */
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/**
 * Records a failed login attempt for a user, locking the account for
 * LOCKOUT_DURATION_MS once LOCKOUT_THRESHOLD consecutive failures are
 * reached (FR-02 5-attempt lockout).
 *
 * @param {number} id - The user's id.
 * @returns {Promise<{attempts: number, lockedUntil: (string|null)}>} The
 *   updated attempt count and lock expiry (null when not locked).
 */
async function registerFailedLogin(id) {
  const user = db.prepare('SELECT failed_attempts FROM users WHERE id = ?').get(id);
  const attempts = (user ? user.failed_attempts : 0) + 1;
  const lockedUntil = attempts >= LOCKOUT_THRESHOLD
    ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
    : null;

  db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
    .run(attempts, lockedUntil, id);

  return { attempts, lockedUntil };
}

/**
 * Clears the failed-login counter and any lock on a user, called after a
 * successful login (FR-02).
 *
 * @param {number} id - The user's id.
 * @returns {Promise<void>}
 */
async function clearFailedLogins(id) {
  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);
}

module.exports = {
  findByEmail, create, registerFailedLogin, clearFailedLogins, LOCKOUT_THRESHOLD,
};
