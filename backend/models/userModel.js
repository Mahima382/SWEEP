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
    'SELECT id, name, email, password_hash, role, region, kyc_status, status, reason, joined FROM users WHERE email = ?',
    [email],
  );
  return rows.length > 0 ? rows[0] : null;
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
    user.password_hash,
    user.role,
    user.region,
    user.kyc_status,
    user.status,
  ];
  const [result] = await db.query(
    'INSERT INTO users (name, email, password_hash, role, region, kyc_status, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
    'SELECT id, name, email, password_hash, role, region, kyc_status, status, reason, joined FROM users WHERE id = ?',
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
 * @returns {Promise<number>} The number of affected rows
 */
async function updateStatus(userId, updates) {
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

  const [result] = await db.query(
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

module.exports = {
  findByEmail,
  findById,
  findAll,
  create,
  updateStatus,
  isSuperAdmin,
};