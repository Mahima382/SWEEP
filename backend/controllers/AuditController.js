/**
 * Audit log controller (FR-11 §4). Admin Portal.
 * Exposes searchable/filterable audit records and a CSV export. Records are
 * written by the audit service (fail-closed) from within sensitive actions; this
 * controller only reads them. Tamper-evidence is inherent in the stored hash chain.
 */

const auditModel = require('../models/auditModel');

/**
 * Serialises audit rows to CSV.
 *
 * @param {object[]} rows - Audit rows.
 * @returns {string} CSV text with a header row.
 */
function toCsv(rows) {
  const header = ['id', 'actor_id', 'actor_role', 'action', 'target_type', 'target_id', 'details', 'created_at', 'record_hash'];
  const escape = (val) => {
    if (val === null || val === undefined) { return ''; }
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = rows.map((r) => header.map((h) => escape(r[h])).join(','));
  return [header.join(','), ...lines].join('\n');
}

/**
 * Lists audit logs with filters.
 *
 * @param {object} req - Express request query: actorId, action, targetType,
 *   targetId, dateFrom, dateTo, search.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listAuditLogs(req, res) {
  try {
    const {
      actorId, action, targetType, targetId, dateFrom, dateTo, search,
    } = req.query;
    const filters = {};
    if (actorId) { filters.actorId = parseInt(actorId, 10); }
    if (action) { filters.action = action; }
    if (targetType) { filters.targetType = targetType; }
    if (targetId) { filters.targetId = parseInt(targetId, 10); }
    if (dateFrom) { filters.dateFrom = dateFrom; }
    if (dateTo) { filters.dateTo = dateTo; }
    if (search) { filters.search = search; }
    const rows = await auditModel.listAuditLogs(filters);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list audit logs' });
  }
}

/**
 * Exports audit logs as CSV.
 *
 * @param {object} req - Express request query: same filters as listAuditLogs.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function exportAuditLogs(req, res) {
  try {
    const {
      actorId, action, targetType, targetId, dateFrom, dateTo, search,
    } = req.query;
    const filters = {};
    if (actorId) { filters.actorId = parseInt(actorId, 10); }
    if (action) { filters.action = action; }
    if (targetType) { filters.targetType = targetType; }
    if (targetId) { filters.targetId = parseInt(targetId, 10); }
    if (dateFrom) { filters.dateFrom = dateFrom; }
    if (dateTo) { filters.dateTo = dateTo; }
    if (search) { filters.search = search; }
    const rows = await auditModel.listAuditLogs(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    return res.status(200).send(toCsv(rows));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to export audit logs' });
  }
}

module.exports = { listAuditLogs, exportAuditLogs, toCsv };
