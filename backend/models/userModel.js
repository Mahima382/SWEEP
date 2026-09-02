/**
 * User model — data access for the users table (D1 Users).
 * Model layer only: no Express imports, SQL via the shared pool.
 */

const db = require('../config/db');

/**
 * Finds a user by email.
 *
 * @param {string} email - The user's email address
 * @returns {Promise<object|null>} The user row, or null if not found
 */
async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, nid, password_hash, role, region, kyc_status, status, reason, joined, token_version, login_attempts, lockout_until, reset_token, reset_expires, kyc_rejected_at FROM users WHERE email = ?',
    [email],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Finds a user by NID.
 *
 * @param {string} nid - The user's NID
 * @returns {Promise<object|null>} The user row, or null if not found
 */
async function findByNid(nid) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, nid, password_hash, role, region, kyc_status, status, reason, joined, token_version, login_attempts, lockout_until, reset_token, reset_expires, kyc_rejected_at FROM users WHERE nid = ?',
    [nid],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Checks if NID or Email is in a suspended/banned account (blacklist).
 *
 * @param {string} nid - NID to check
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if blacklisted
 */
async function isBlacklisted(nid, email) {
  const [rows] = await db.query(
    'SELECT id FROM users WHERE (nid = ? OR email = ?) AND status IN (?, ?)',
    [nid, email, 'suspended', 'banned'],
  );
  return rows.length > 0;
}

/**
 * Creates a new user.
 *
 * @param {object} user - The user data
 * @returns {Promise<object>} The created user row
 */
async function create(user) {
  const params = [
    user.name,
    user.email,
    user.phone,
    user.nid,
    user.password_hash,
    user.role,
    user.region,
    user.kyc_status,
    user.status,
  ];
  const [result] = await db.query(
    'INSERT INTO users (name, email, phone, nid, password_hash, role, region, kyc_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    params,
  );
  return { insertId: result.insertId };
}

/**
 * Finds a user by id.
 *
 * @param {number} userId - The user's id
 * @returns {Promise<object|null>} The user row, or null if not found
 */
async function findById(userId) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, nid, password_hash, role, region, kyc_status, status, reason, joined, token_version, login_attempts, lockout_until, reset_token, reset_expires, kyc_rejected_at FROM users WHERE id = ?',
    [userId],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Finds users with optional search, role, and status filters.
 *
 * @param {object} filters - Optional filters { search, role, status }
 * @param {string} [filters.search] - Search term to match against name or email (case-insensitive)
 * @param {string} [filters.role] - Role to filter by
 * @param {string} [filters.status] - Status to filter by
 * @returns {Promise<object[]>} List of user rows
 */
async function findAll(filters = {}) {
  let query = 'SELECT id, name, email, role, region, kyc_status, status, reason, joined, created_at, updated_at FROM users';
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.role) {
    conditions.push('role = ?');
    params.push(filters.role);
  }
  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
}

/**
 * Updates a user's status and/or reason (for suspend/ban/reinstate).
 *
 * @param {number} userId - The user's id
 * @param {object} updates - Updates { status, reason }
 * @param {string} [updates.status] - New status (active, suspended, banned, pending)
 * @param {string} [updates.reason] - Reason for the status change (required for suspend/ban)
 * @param {object} [connection] - Optional db connection for transactions
 * @returns {Promise<number>} The number of affected rows
 */
async function updateStatus(userId, updates, connection) {
  const cx = connection || db;
  const sets = [];
  const params = [];

  if (updates.status !== undefined) {
    sets.push('status = ?');
    params.push(updates.status);
  }
  if (updates.reason !== undefined) {
    sets.push('reason = ?');
    params.push(updates.reason);
  }

  if (sets.length === 0) {
    throw new Error('No updates provided');
  }

  params.push(userId);

  const [result] = await cx.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    params,
  );
  return result.affectedRows;
}

/**
 * Updates a user's KYC status.
 *
 * @param {number} userId - The user's id
 * @param {string} kycStatus - New KYC status (pending, verified, rejected)
 * @param {string} [reason] - Reason for the KYC rejection (required if rejecting)
 * @param {object} [connection] - Optional db connection for transactions
 * @returns {Promise<number>} The number of affected rows
 */
async function updateKycStatus(userId, kycStatus, reason, connection) {
  const cx = connection || db;
  const sets = [];
  const params = [];

  sets.push('kyc_status = ?');
  params.push(kycStatus);

  if (kycStatus === 'rejected') {
    sets.push('kyc_rejected_at = ?');
    params.push(new Date());
  }

  if (reason && reason.trim().length > 0 && kycStatus === 'rejected') {
    sets.push('reason = ?');
    params.push(reason.trim());
  }

  if (sets.length === 0) {
    throw new Error('No updates provided');
  }

  params.push(userId);

  const [result] = await cx.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    params,
  );
  return result.affectedRows;
}

/**
 * Checks if a user is a protected super-admin.
 *
 * @param {number} userId - The user's id
 * @returns {Promise<boolean>} True if the user is an admin (protected from suspend/ban)
 */
async function isSuperAdmin(userId) {
  const user = await findById(userId);
  return user && user.role === 'admin';
}

/**
 * Increments the user's token_version to invalidate all existing sessions.
 *
 * @param {number} userId - The user's id
 * @returns {Promise<void>}
 */
async function incrementTokenVersion(userId) {
  await db.query(
    'UPDATE users SET token_version = IFNULL(token_version, 0) + 1 WHERE id = ?',
    [userId],
  );
}

/**
 * Updates login attempts and lockout status.
 *
 * @param {number} userId - The user's id
 * @param {number} attempts - Number of failed attempts
 * @param {Date|null} lockoutUntil - Lockout expiration
 * @returns {Promise<void>}
 */
async function updateLoginAttempts(userId, attempts, lockoutUntil) {
  await db.query(
    'UPDATE users SET login_attempts = ?, lockout_until = ? WHERE id = ?',
    [attempts, lockoutUntil, userId],
  );
}

/**
 * Saves a reset token and its expiration.
 *
 * @param {number} userId - The user's id
 * @param {string} hashedToken - Hashed token
 * @param {Date} expires - Expiration time
 * @returns {Promise<void>}
 */
async function saveResetToken(userId, hashedToken, expires) {
  await db.query(
    'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
    [hashedToken, expires, userId],
  );
}

/**
 * Clears the reset token.
 *
 * @param {number} userId - The user's id
 * @returns {Promise<void>}
 */
async function clearResetToken(userId) {
  await db.query(
    'UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?',
    [userId],
  );
}

/**
 * Updates a user's password.
 *
 * @param {number} userId - The user's id
 * @param {string} passwordHash - New hashed password
 * @returns {Promise<void>}
 */
async function updatePassword(userId, passwordHash) {
  await db.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, userId],
  );
}

module.exports = {
  findByEmail,
  findByNid,
  isBlacklisted,
  findById,
  findAll,
  create,
  updateStatus,
  updateKycStatus,
  isSuperAdmin,
  incrementTokenVersion,
  updateLoginAttempts,
  saveResetToken,
  clearResetToken,
  updatePassword,
};