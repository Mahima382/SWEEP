/**
 * Subscription management controller (FR-11 §2). Admin Portal.
 * Create / edit / archive subscription plans. Plans are never deleted: archive
 * is the safe alternative and keeps existing subscribers intact.
 */

const subscriptionModel = require('../models/subscriptionModel');

/**
 * Creates a subscription plan.
 *
 * @param {object} req - Express request body: name, price, durationDays,
 *   currency?, features?.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function createPlan(req, res) {
  try {
    const {
      name, price, durationDays, currency, features,
    } = req.body;
    if (!name || typeof price !== 'number' || typeof durationDays !== 'number') {
      return res.status(400).json({ error: 'name, price and durationDays are required' });
    }
    const created = await subscriptionModel.createPlan({
      name, price, durationDays, currency, features,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create plan' });
  }
}

/**
 * Lists subscription plans.
 *
 * @param {object} req - Express request query: includeArchived ('true' to include).
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listPlans(req, res) {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const rows = await subscriptionModel.listPlans({ includeArchived });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list plans' });
  }
}

/**
 * Updates a subscription plan.
 *
 * @param {object} req - Express request: params.planId, body editable fields.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function updatePlan(req, res) {
  try {
    const planId = parseInt(req.params.planId, 10);
    const {
      name, price, durationDays, currency, features,
    } = req.body;
    const updates = {};
    if (name !== undefined) { updates.name = name; }
    if (price !== undefined) { updates.price = price; }
    if (durationDays !== undefined) { updates.durationDays = durationDays; }
    if (currency !== undefined) { updates.currency = currency; }
    if (features !== undefined) { updates.features = features; }

    if ((await subscriptionModel.getPlan(planId)) === null) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const affectedRows = await subscriptionModel.updatePlan(planId, updates);
    if (affectedRows === 0) {
      return res.status(400).json({ error: 'No changes applied' });
    }
    return res.json({ message: 'Plan updated', planId });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to update plan' });
  }
}

/**
 * Archives a subscription plan (no hard delete).
 *
 * @param {object} req - Express request params: planId.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function archivePlan(req, res) {
  try {
    const planId = parseInt(req.params.planId, 10);
    if ((await subscriptionModel.getPlan(planId)) === null) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const { affectedRows, inUse } = await subscriptionModel.archivePlan(planId);
    if (affectedRows === 0) {
      return res.status(400).json({ error: 'Plan could not be archived' });
    }
    return res.json({
      message: 'Plan archived',
      planId,
      inUse,
      note: inUse
        ? 'Plan had active subscribers; they are unaffected. Plan is now unavailable for new signups.'
        : 'Plan archived and unavailable for new signups.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to archive plan' });
  }
}

module.exports = {
  createPlan, listPlans, updatePlan, archivePlan,
};
