/**
 * Admin Portal API client (FR-11). Thin wrappers around the shared `api`
 * service for every admin backend endpoint. Each function maps the backend's
 * response shape to something the admin views can render directly.
 */

import {
  get,
  post,
  getText,
  request,
} from './api';

/* ------------------------------------------------------------------ *
 * User Management + KYC (mounted at /api/admin/users)
 * ------------------------------------------------------------------ */

/**
 * List users with optional search / role / status filters.
 * @param {object} [filters] - { search, role, status }.
 * @returns {Promise<object[]>} User rows.
 */
export function listUsers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) { params.set('search', filters.search); }
  if (filters.role) { params.set('role', filters.role); }
  if (filters.status) { params.set('status', filters.status); }
  const qs = params.toString();
  return get(`/admin/users${qs ? `?${qs}` : ''}`);
}

/**
 * Suspend or ban a user (requires a reason).
 * @param {number} userId - Target user id.
 * @param {'Suspend'|'Ban'} action - Action kind.
 * @param {string} reason - Required reason.
 * @returns {Promise<object>} Backend result.
 */
export function suspendOrBanUser(userId, action, reason) {
  const path = action === 'Ban' ? `/admin/users/${userId}/ban` : `/admin/users/${userId}/suspend`;
  return post(path, { action, reason });
}

/**
 * Reinstate a suspended / banned user.
 * @param {number} userId - Target user id.
 * @returns {Promise<object>} Backend result.
 */
export function reinstateUser(userId) {
  return post(`/admin/users/${userId}/reinstate`, {});
}

/**
 * Verify a user's KYC status.
 * @param {number} userId - Target user id.
 * @returns {Promise<object>} Backend result.
 */
export function kycVerifyUser(userId) {
  return post(`/admin/users/${userId}/kyc-verify`, {});
}

/**
 * Reject a user's KYC status (requires a reason).
 * @param {number} userId - Target user id.
 * @param {string} reason - Required reason.
 * @returns {Promise<object>} Backend result.
 */
export function kycRejectUser(userId, reason) {
  return post(`/admin/users/${userId}/kyc-reject`, { reason });
}

/**
 * Force expire all active sessions for a user (FR-12).
 * @param {number} userId - Target user id.
 * @returns {Promise<object>} Backend result.
 */
export function forceExpireSessions(userId) {
  return post(`/admin/users/${userId}/force-expire`, {});
}

/* ------------------------------------------------------------------ *
 * Pricing & Commission (mounted at /api/admin/pricing)
 * ------------------------------------------------------------------ */

/**
 * List versioned base prices.
 * @param {object} [filters] - { wasteCategory, region }.
 * @returns {Promise<object[]>} Price version rows.
 */
export function listPriceVersions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.wasteCategory) { params.set('wasteCategory', filters.wasteCategory); }
  if (filters.region) { params.set('region', filters.region); }
  const qs = params.toString();
  return get(`/admin/pricing/price${qs ? `?${qs}` : ''}`);
}

/**
 * Create a versioned base price.
 * @param {object} payload - { wasteCategory, region, basePriceMin, basePriceMax, effectiveDate }.
 * @returns {Promise<object>} Created row.
 */
export function createPriceVersion(payload) {
  return post('/admin/pricing/price', payload);
}

/**
 * List versioned commission rates.
 * @param {object} [filters] - { transactionType }.
 * @returns {Promise<object[]>} Commission version rows.
 */
export function listCommissionVersions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.transactionType) { params.set('transactionType', filters.transactionType); }
  const qs = params.toString();
  return get(`/admin/pricing/commission${qs ? `?${qs}` : ''}`);
}

/**
 * Create a versioned commission rate.
 * @param {object} payload - { transactionType, commissionRate, effectiveDate }.
 * @returns {Promise<object>} Created row.
 */
export function createCommissionVersion(payload) {
  return post('/admin/pricing/commission', payload);
}

/* ------------------------------------------------------------------ *
 * Subscriptions (mounted at /api/admin/subscriptions)
 * ------------------------------------------------------------------ */

/**
 * List subscription plans.
 * @param {boolean} [includeArchived] - Include archived plans.
 * @returns {Promise<object[]>} Plan rows.
 */
export function listPlans(includeArchived = false) {
  const qs = includeArchived ? '?includeArchived=true' : '';
  return get(`/admin/subscriptions/plans${qs}`);
}

/**
 * Create a subscription plan.
 * @param {object} payload - { name, price, durationDays, currency?, features? }.
 * @returns {Promise<object>} Created plan.
 */
export function createPlan(payload) {
  return post('/admin/subscriptions/plans', payload);
}

/* small PUT helper (api.js only exposes request/get/post) */
async function apiPut(path, data) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) });
}

/**
 * Update a subscription plan.
 * @param {number} planId - Plan id.
 * @param {object} updates - Editable fields.
 * @returns {Promise<object>} Backend result.
 */
export function updatePlan(planId, updates) {
  return apiPut(`/admin/subscriptions/plans/${planId}`, updates);
}

/**
 * Archive a subscription plan (no hard delete).
 * @param {number} planId - Plan id.
 * @returns {Promise<object>} Backend result.
 */
export function archivePlan(planId) {
  return post(`/admin/subscriptions/plans/${planId}/archive`, {});
}

/* ------------------------------------------------------------------ *
 * Fraud Detection (mounted at /api/admin/fraud)
 * ------------------------------------------------------------------ */

/**
 * List the fraud queue.
 * @param {object} [filters] - { status, userId }.
 * @returns {Promise<object[]>} Flag rows.
 */
export function listFraudQueue(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) { params.set('status', filters.status); }
  if (filters.userId) { params.set('userId', String(filters.userId)); }
  const qs = params.toString();
  return get(`/admin/fraud/queue${qs ? `?${qs}` : ''}`);
}

/**
 * List available fraud rules.
 * @returns {Promise<object[]>} Rule descriptors.
 */
export function listFraudRules() {
  return get('/admin/fraud/rules');
}

/**
 * Get a single fraud flag.
 * @param {number} flagId - Flag id.
 * @returns {Promise<object>} Flag row.
 */
export function getFlag(flagId) {
  return get(`/admin/fraud/flags/${flagId}`);
}

/**
 * Create a fraud flag (manual or via rule evaluation).
 * @param {object} payload - { userId, rule, severity?, details?, orderId?, context? }.
 * @returns {Promise<object>} Created flag.
 */
export function createFlag(payload) {
  return post('/admin/fraud/flags', payload);
}

/**
 * Clear a fraud flag.
 * @param {number} flagId - Flag id.
 * @param {string} [note] - Optional decision note.
 * @returns {Promise<object>} Backend result.
 */
export function clearFlag(flagId, note) {
  return post(`/admin/fraud/flags/${flagId}/clear`, { note });
}

/**
 * Escalate a fraud flag.
 * @param {number} flagId - Flag id.
 * @param {string} [note] - Optional decision note.
 * @returns {Promise<object>} Backend result.
 */
export function escalateFlag(flagId, note) {
  return post(`/admin/fraud/flags/${flagId}/escalate`, { note });
}

/* ------------------------------------------------------------------ *
 * Audit Logs (mounted at /api/admin/audit)
 * ------------------------------------------------------------------ */

/**
 * List audit logs with filters.
 * @param {object} [filters] - { actorId, action, targetType, targetId, dateFrom, dateTo, search }.
 * @returns {Promise<object[]>} Audit rows.
 */
export function listAuditLogs(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return get(`/admin/audit${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch the audit log CSV export as text.
 * @param {object} [filters] - Same filters as listAuditLogs.
 * @returns {Promise<string>} CSV text.
 */
export function exportAuditLogsCsv(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return getText(`/admin/audit/export${qs ? `?${qs}` : ''}`);
}

/* ------------------------------------------------------------------ *
 * Operational Reports (mounted at /api/admin/reports)
 * ------------------------------------------------------------------ */

/**
 * Collection volume report.
 * @returns {Promise<object>} { available, byCategory, byRegion }.
 */
export function collectionVolumeReport() {
  return get('/admin/reports/collection-volume');
}

/**
 * Revenue report.
 * @returns {Promise<object>} { available, commission, subscription }.
 */
export function revenueReport() {
  return get('/admin/reports/revenue');
}

/**
 * Environmental impact report.
 * @returns {Promise<object>} { available, estimated, byCategory, totalEstimatedCO2 }.
 */
export function environmentalImpactReport() {
  return get('/admin/reports/environmental-impact');
}

export default {
  listUsers,
  suspendOrBanUser,
  reinstateUser,
  kycVerifyUser,
  kycRejectUser,
  forceExpireSessions,
  listPriceVersions,
  createPriceVersion,
  listCommissionVersions,
  createCommissionVersion,
  listPlans,
  createPlan,
  updatePlan,
  archivePlan,
  listFraudQueue,
  listFraudRules,
  getFlag,
  createFlag,
  clearFlag,
  escalateFlag,
  listAuditLogs,
  exportAuditLogsCsv,
  collectionVolumeReport,
  revenueReport,
  environmentalImpactReport,
};
