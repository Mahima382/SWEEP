/**
 * Subscription plan model (FR-11 §2). Model layer only: no Express imports, SQL
 * via the shared pool. Plans can be created, edited, and archived. Deletion is
 * intentionally NOT supported: a plan that has active subscribers is archived
 * instead, making it unavailable for new signups while existing subscribers keep
 * their plan. The "in use" check counts rows in the subscriptions table.
 */

const db = require('../config/db');

/**
 * Creates a subscription plan.
 *
 * @param {object} plan - Plan fields.
 * @param {string} plan.name - Plan name (Basic/Pro/Enterprise, etc.).
 * @param {number} plan.price - Recurring price.
 * @param {number} plan.durationDays - Billing period length in days.
 * @param {string} [plan.currency] - ISO currency code (default 'BDT').
 * @param {object} [plan.features] - Optional feature map.
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<object>} Created plan row.
 */
async function createPlan(plan, connection) {
  const cx = connection || db;
  const features = plan.features ? JSON.stringify(plan.features) : null;
  const [result] = await cx.query(
    `INSERT INTO subscription_plans (name, price, duration_days, currency, features, archived)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    [plan.name, plan.price, plan.durationDays, plan.currency || 'BDT', features],
  );
  return {
    id: result.insertId,
    name: plan.name,
    price: plan.price,
    durationDays: plan.durationDays,
    currency: plan.currency || 'BDT',
    features: plan.features || null,
    archived: false,
  };
}

/**
 * Lists subscription plans.
 *
 * @param {object} [filters] - Optional filters.
 * @param {boolean} [filters.includeArchived] - Include archived plans (default false).
 * @returns {Promise<object[]>} Plan rows.
 */
async function listPlans(filters = {}) {
  let query = `SELECT id, name, price, duration_days, currency, features, archived, created_at
    FROM subscription_plans`;
  if (!filters.includeArchived) {
    query += ' WHERE archived = FALSE';
  }
  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query);
  return rows;
}

/**
 * Gets a single plan by id.
 *
 * @param {number} planId - Plan id.
 * @returns {Promise<object|null>} Plan row or null.
 */
async function getPlan(planId) {
  const [rows] = await db.query(
    'SELECT id, name, price, duration_days, currency, features, archived, created_at FROM subscription_plans WHERE id = ?',
    [planId],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Updates an editable plan (name/price/duration/features). Archived plans may
 * still be edited for display, but pricing edits on an in-use plan should be
 * reviewed by the caller via isPlanInUse.
 *
 * @param {number} planId - Plan id.
 * @param {object} updates - Editable fields.
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<number>} Affected rows.
 */
async function updatePlan(planId, updates, connection) {
  const cx = connection || db;
  const sets = [];
  const params = [];
  if (updates.name !== undefined) {
    sets.push('name = ?');
    params.push(updates.name);
  }
  if (updates.price !== undefined) {
    sets.push('price = ?');
    params.push(updates.price);
  }
  if (updates.durationDays !== undefined) {
    sets.push('duration_days = ?');
    params.push(updates.durationDays);
  }
  if (updates.currency !== undefined) {
    sets.push('currency = ?');
    params.push(updates.currency);
  }
  if (updates.features !== undefined) {
    sets.push('features = ?');
    params.push(JSON.stringify(updates.features));
  }
  if (sets.length === 0) {
    throw new Error('No updatable fields provided');
  }
  params.push(planId);
  const [result] = await cx.query(
    `UPDATE subscription_plans SET ${sets.join(', ')} WHERE id = ?`,
    params,
  );
  return result.affectedRows;
}

/**
 * Reports whether a plan currently has active subscribers.
 *
 * @param {number} planId - Plan id.
 * @returns {Promise<boolean>} True if at least one active subscription references it.
 */
async function isPlanInUse(planId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS cnt FROM subscriptions WHERE plan_id = ? AND status = 'active'",
    [planId],
  );
  return rows[0].cnt > 0;
}

/**
 * Archives a plan (soft "delete"). Safe for in-use plans: existing subscribers
 * are unaffected, the plan simply becomes unavailable for new signups.
 *
 * @param {number} planId - Plan id.
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<object>} { affectedRows, inUse }.
 */
async function archivePlan(planId, connection) {
  const cx = connection || db;
  const inUse = await isPlanInUse(planId);
  const [result] = await cx.query(
    'UPDATE subscription_plans SET archived = TRUE WHERE id = ?',
    [planId],
  );
  return { affectedRows: result.affectedRows, inUse };
}

module.exports = {
  createPlan,
  listPlans,
  getPlan,
  updatePlan,
  isPlanInUse,
  archivePlan,
};
