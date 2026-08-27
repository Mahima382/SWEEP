/**
 * Fraud detection controller (FR-11 §3). Admin Portal.
 * Exposes the fraud queue, manual flag creation, rule evaluation, and the
 * clear/escalate admin decisions. Clear/escalate are audited fail-closed.
 */

const fraudModel = require('../models/fraudModel');
const fraudService = require('../services/fraudService');
const { withAudit } = require('../services/auditService');

const SEVERITIES = ['low', 'medium', 'high'];

/**
 * Lists the fraud queue (optionally filtered by status).
 *
 * @param {object} req - Express request query: status, userId.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listQueue(req, res) {
  try {
    const { status, userId } = req.query;
    const filters = {};
    if (status) { filters.status = status; }
    if (userId) { filters.userId = parseInt(userId, 10); }
    const rows = await fraudModel.listFlags(filters);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list fraud queue' });
  }
}

/**
 * Returns available fraud rules.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function listRules(req, res) {
  return res.json(fraudService.listRules());
}

/**
 * Gets a single flag.
 *
 * @param {object} req - Express request params: flagId.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function getFlag(req, res) {
  try {
    const flag = await fraudModel.getFlag(parseInt(req.params.flagId, 10));
    if (!flag) { return res.status(404).json({ error: 'Flag not found' }); }
    return res.json(flag);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to get flag' });
  }
}

/**
 * Creates a fraud flag manually (admin-raised) or via rule evaluation.
 *
 * @param {object} req - Express request body: userId, rule, severity?, details?,
 *   orderId?, context? (context runs a rule to derive severity/details).
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function createFlag(req, res) {
  try {
    const {
      userId, rule, severity, details, orderId, context,
    } = req.body;

    if (!userId || !rule) {
      return res.status(400).json({ error: 'userId and rule are required' });
    }

    let resolvedSeverity = severity;
    let resolvedDetails = details;
    if (context) {
      const triggered = fraudService.evaluateRule(rule, context);
      if (!triggered) {
        return res.status(200).json({ message: 'Rule not triggered', triggered: false });
      }
      resolvedSeverity = triggered.severity;
      resolvedDetails = triggered.details;
    } else if (!SEVERITIES.includes(resolvedSeverity)) {
      resolvedSeverity = 'low';
    }

    const created = await fraudModel.createFlag({
      userId: parseInt(userId, 10),
      rule,
      severity: resolvedSeverity,
      details: resolvedDetails,
      orderId: orderId ? parseInt(orderId, 10) : undefined,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create flag' });
  }
}

/**
 * Clears a fraud flag (audited, fail-closed).
 *
 * @param {object} req - Express request params: flagId; body: note.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function clearFlag(req, res) {
  try {
    const flagId = parseInt(req.params.flagId, 10);
    const flag = await fraudModel.getFlag(flagId);
    if (!flag) { return res.status(404).json({ error: 'Flag not found' }); }
    if (flag.status !== 'pending') {
      return res.status(409).json({ error: `Flag already ${flag.status}` });
    }
    await withAudit(
      {
        actorId: req.user.id,
        actorRole: 'admin',
        action: 'fraud.cleared',
        targetType: 'fraud_flag',
        targetId: flagId,
        details: { note: req.body.note || null, rule: flag.rule },
      },
      async (conn) => fraudModel.decideFlag(flagId, 'cleared', req.user.id, req.body.note, conn),
    );
    return res.json({ message: 'Flag cleared', flagId });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to clear flag' });
  }
}

/**
 * Escalates a fraud flag (audited, fail-closed).
 *
 * @param {object} req - Express request params: flagId; body: note.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function escalateFlag(req, res) {
  try {
    const flagId = parseInt(req.params.flagId, 10);
    const flag = await fraudModel.getFlag(flagId);
    if (!flag) { return res.status(404).json({ error: 'Flag not found' }); }
    if (flag.status !== 'pending') {
      return res.status(409).json({ error: `Flag already ${flag.status}` });
    }
    await withAudit(
      {
        actorId: req.user.id,
        actorRole: 'admin',
        action: 'fraud.escalated',
        targetType: 'fraud_flag',
        targetId: flagId,
        details: { note: req.body.note || null, rule: flag.rule },
      },
      async (conn) => fraudModel.decideFlag(flagId, 'escalated', req.user.id, req.body.note, conn),
    );
    return res.json({ message: 'Flag escalated', flagId });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to escalate flag' });
  }
}

module.exports = {
  listQueue,
  listRules,
  getFlag,
  createFlag,
  clearFlag,
  escalateFlag,
};
