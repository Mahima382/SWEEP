/**
 * Audit service (FR-11 §4). Provides the fail-closed write pattern used by all
 * sensitive Admin actions: the action and its audit record are committed inside
 * a single transaction. If the audit record cannot be written, the transaction
 * rolls back and the sensitive action never takes effect.
 */

const { withTransaction } = require('./dbTransaction');
const auditModel = require('../models/auditModel');

/**
 * Runs an action and its audit record atomically (fail-closed).
 *
 * @param {object} auditEntry - Audit fields (see auditModel.createAuditLog).
 * @param {Function} actionFn - Async callback receiving the live connection;
 *   performs the sensitive action. Return value is propagated to the caller.
 * @returns {Promise<*>} The action's result.
 */
async function withAudit(auditEntry, actionFn) {
  return withTransaction(async (connection) => {
    const result = await actionFn(connection);
    await auditModel.createAuditLog(auditEntry, connection);
    return result;
  });
}

/**
 * Writes an audit record on its own (e.g. for read-less, pure-log events).
 *
 * @param {object} auditEntry - Audit fields.
 * @returns {Promise<object>} The created audit row.
 */
async function record(auditEntry) {
  return auditModel.createAuditLog(auditEntry);
}

module.exports = { withAudit, record };
