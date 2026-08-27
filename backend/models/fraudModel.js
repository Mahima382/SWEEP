/**
 * Fraud-flag model (FR-11 §3). Model layer only: no Express imports, SQL via the
 * shared pool. Stores rule-based fraud flags raised against users/orders. Flags
 * move through statuses: pending -> cleared | escalated. Admin decisions
 * (clear/escalate) are recorded with the acting admin and a note.
 */

const db = require('../config/db');

/**
 * Creates a fraud flag.
 *
 * @param {object} flag - Flag fields.
 * @param {number} flag.userId - User the flag is raised against.
 * @param {string} flag.rule - Rule id that triggered (e.g. 'weight_variance').
 * @param {string} flag.severity - 'low' | 'medium' | 'high'.
 * @param {string} [flag.details] - Human-readable context.
 * @param {number} [flag.orderId] - Optional related order id.
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<object>} Created flag row.
 */
async function createFlag(flag, connection) {
  const cx = connection || db;
  const [result] = await cx.query(
    `INSERT INTO fraud_flags (user_id, order_id, rule, severity, details, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [
      flag.userId,
      flag.orderId || null,
      flag.rule,
      flag.severity || 'low',
      flag.details || null,
    ],
  );
  return {
    id: result.insertId,
    userId: flag.userId,
    orderId: flag.orderId || null,
    rule: flag.rule,
    severity: flag.severity || 'low',
    details: flag.details || null,
    status: 'pending',
  };
}

/**
 * Lists fraud flags with optional status filter.
 *
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.status] - 'pending' | 'cleared' | 'escalated'.
 * @param {number} [filters.userId] - Filter by user.
 * @returns {Promise<object[]>} Flag rows (newest first).
 */
async function listFlags(filters = {}) {
  const conditions = [];
  const params = [];
  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.userId !== undefined) {
    conditions.push('user_id = ?');
    params.push(filters.userId);
  }
  let query = `SELECT id, user_id, order_id, rule, severity, details, status,
    decided_by, decision_note, decided_at, created_at FROM fraud_flags`;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query, params);
  return rows;
}

/**
 * Gets a single flag by id.
 *
 * @param {number} flagId - Flag id.
 * @returns {Promise<object|null>} Flag row or null.
 */
async function getFlag(flagId) {
  const [rows] = await db.query(
    `SELECT id, user_id, order_id, rule, severity, details, status,
      decided_by, decision_note, decided_at, created_at FROM fraud_flags WHERE id = ?`,
    [flagId],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Applies an admin decision (clear or escalate) to a flag.
 *
 * @param {number} flagId - Flag id.
 * @param {string} status - 'cleared' | 'escalated'.
 * @param {number} adminId - Acting admin id.
 * @param {string} [note] - Decision note.
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<number>} Affected rows.
 */
async function decideFlag(flagId, status, adminId, note, connection) {
  const cx = connection || db;
  const [result] = await cx.query(
    `UPDATE fraud_flags SET status = ?, decided_by = ?, decision_note = ?, decided_at = ?
     WHERE id = ?`,
    [status, adminId, note || null, new Date(), flagId],
  );
  return result.affectedRows;
}

module.exports = {
  createFlag, listFlags, getFlag, decideFlag,
};
