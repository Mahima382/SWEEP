/**
 * Audit-log model (FR-11 §4). Model layer only: no Express imports, SQL via
 * the shared pool. Audit records are immutable and tamper-evident — every row
 * carries a SHA-256 hash chaining back to the previous record, so any rewrite
 * of history breaks the chain.
 */

const crypto = require('crypto');
const db = require('../config/db');

/**
 * Computes the tamper-evident hash for an audit row.
 *
 * @param {object} prev - Previous record hash (string) or null for the first row.
 * @param {object} entry - Normalised audit fields.
 * @returns {string} Hex SHA-256 hash.
 */
function computeHash(prev, entry) {
  const basis = [
    prev || '0',
    entry.actorId,
    entry.actorRole,
    entry.action,
    entry.targetType,
    entry.targetId,
    entry.createdAt,
    entry.details,
  ].join('|');
  return crypto.createHash('sha256').update(basis).digest('hex');
}

/**
 * Creates an immutable, tamper-evident audit record.
 *
 * @param {object} entry - Audit fields.
 * @param {number} entry.actorId - Id of the admin performing the action.
 * @param {string} entry.actorRole - Role of the actor (e.g. 'admin').
 * @param {string} entry.action - Action code, e.g. 'user.banned'.
 * @param {string} entry.targetType - Entity type, e.g. 'user'.
 * @param {number|string} entry.targetId - Id of the affected entity.
 * @param {object} [entry.details] - Arbitrary structured context.
 * @param {object} [connection] - Optional live DB connection (for transactions).
 * @returns {Promise<object>} The created audit row including its record_hash.
 */
async function createAuditLog(entry, connection) {
  const cx = connection || db;
  const createdAt = new Date();
  const details = entry.details ? JSON.stringify(entry.details) : null;

  const [last] = await cx.query(
    'SELECT record_hash FROM audit_logs ORDER BY id DESC LIMIT 1',
  );
  const prevHash = last.length > 0 ? last[0].record_hash : null;

  const recordHash = computeHash(prevHash, {
    actorId: entry.actorId,
    actorRole: entry.actorRole,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    createdAt,
    details,
  });

  const [result] = await cx.query(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, target_type, target_id, details, created_at, record_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.actorId,
      entry.actorRole,
      entry.action,
      entry.targetType,
      entry.targetId,
      details,
      createdAt,
      recordHash,
    ],
  );

  return {
    id: result.insertId,
    actorId: entry.actorId,
    actorRole: entry.actorRole,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    details: entry.details || null,
    createdAt,
    recordHash,
  };
}

/**
 * Lists audit records with filtering + full-text search support.
 *
 * @param {object} [filters] - Optional filters.
 * @param {number} [filters.actorId] - Filter by acting admin id.
 * @param {string} [filters.action] - Filter by exact action code.
 * @param {string} [filters.targetType] - Filter by target entity type.
 * @param {number|string} [filters.targetId] - Filter by target entity id.
 * @param {string} [filters.dateFrom] - ISO date lower bound (inclusive).
 * @param {string} [filters.dateTo] - ISO date upper bound (inclusive).
 * @param {string} [filters.search] - Substring match against action/details.
 * @returns {Promise<object[]>} Matching audit rows (oldest first).
 */
async function listAuditLogs(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.actorId !== undefined) {
    conditions.push('actor_id = ?');
    params.push(filters.actorId);
  }
  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }
  if (filters.targetType) {
    conditions.push('target_type = ?');
    params.push(filters.targetType);
  }
  if (filters.targetId !== undefined) {
    conditions.push('target_id = ?');
    params.push(filters.targetId);
  }
  if (filters.dateFrom) {
    conditions.push('created_at >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push('created_at <= ?');
    params.push(filters.dateTo);
  }
  if (filters.search) {
    conditions.push('(action LIKE ? OR details LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  let query = `SELECT id, actor_id, actor_role, action, target_type, target_id,
    details, created_at, record_hash FROM audit_logs`;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY id ASC';

  const [rows] = await db.query(query, params);
  return rows;
}

module.exports = { createAuditLog, listAuditLogs, computeHash };
