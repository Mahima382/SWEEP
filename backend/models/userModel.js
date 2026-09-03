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
 * Finds a user by id.
 *
 * @param {number} id - The user's id.
 * @returns {Promise<object|null>} The user row, or null if not found.
 */
async function findById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
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

/**
 * Saves the post-login profile-completion data for a user (see
 * PROFILE_COMPLETION_SPEC.md) and marks their profile as completed.
 * Stored as a single JSON blob: the field set varies too widely by role
 * (household address vs. company KYC documents vs. driving licences) to
 * justify a wide, mostly-null column set in SQLite.
 *
 * @param {number} id - The user's id.
 * @param {object} profileData - Role-specific profile fields, already
 *   validated by utils/validators.js#validateProfileData.
 * @returns {Promise<void>}
 */
async function completeProfile(id, profileData) {
  db.prepare('UPDATE users SET profile_completed = 1, profile_data = ? WHERE id = ?')
    .run(JSON.stringify(profileData), id);
}

/**
 * Sets a password-reset token and its expiry on a user (FR-12 password
 * reset). Overwrites any previous token — only the most recently requested
 * link is valid.
 *
 * @param {number} id - The user's id.
 * @param {string} token - The generated reset token.
 * @param {string} expiresAt - ISO timestamp after which the token is invalid.
 * @returns {Promise<void>}
 */
async function setResetToken(id, token, expiresAt) {
  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
    .run(token, expiresAt, id);
}

/**
 * Finds a user by an in-date password-reset token. A token that exists but
 * has expired is treated the same as no match — the caller doesn't need to
 * special-case expiry.
 *
 * @param {string} token - The reset token from the reset-password request.
 * @returns {Promise<object|null>} The user row, or null if the token is
 *   unknown or expired.
 */
async function findByResetToken(token) {
  const row = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
  if (!row || !row.reset_token_expires) {
    return null;
  }
  return new Date(row.reset_token_expires) > new Date() ? row : null;
}

/**
 * Sets a new password hash for a user and consumes their reset token, so it
 * cannot be replayed. Also clears any login lockout — a successful reset is
 * a legitimate way out of a lockout (FR-02, FR-12).
 *
 * @param {number} id - The user's id.
 * @param {string} passwordHash - The new bcrypt password hash.
 * @returns {Promise<void>}
 */
async function resetPassword(id, passwordHash) {
  db.prepare(`
    UPDATE users
    SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL,
        failed_attempts = 0, locked_until = NULL
    WHERE id = ?
  `).run(passwordHash, id);
}

/**
 * Shapes a raw user row into the object safe to send to the client: never
 * includes the password hash, and parses the stored profile JSON back into
 * an object.
 *
 * @param {object} row - Raw row from the users table.
 * @returns {object} Public user representation.
 */
function toPublicUser(row) {
  let profileData = null;
  try {
    profileData = row.profile_data ? JSON.parse(row.profile_data) : null;
  } catch (err) {
    profileData = null;
  }

  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    status: row.status,
    profileCompleted: !!row.profile_completed,
    profileData,
  };
}

module.exports = {
  findByEmail,
  findById,
  create,
  registerFailedLogin,
  clearFailedLogins,
  completeProfile,
  setResetToken,
  findByResetToken,
  resetPassword,
  toPublicUser,
  LOCKOUT_THRESHOLD,
};
