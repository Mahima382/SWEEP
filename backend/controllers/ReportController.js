/**
 * Operational report controller (FR-11 §5). Admin Portal.
 * Platform analytics: collection volume, revenue, environmental impact. All data
 * is aggregated from real records; when the underlying tables are not yet created
 * in the shared schema the endpoint reports availability rather than fabricating
 * numbers.
 */

const reportModel = require('../models/reportModel');

/**
 * Builds a graceful response: real data when available, else an availability note.
 *
 * @param {Function} fn - Async report query.
 * @returns {Promise<object>} { ok, data } or { ok:false, note }.
 */
async function safeReport(fn) {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err && err.code === 'ER_NO_SUCH_TABLE') {
      return { ok: false, note: 'Required data tables not yet created in the shared schema (see DB-requirements).' };
    }
    throw err;
  }
}

/**
 * Collection volume report.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function collectionVolume(req, res) {
  try {
    const result = await safeReport(() => reportModel.collectionVolume());
    if (!result.ok) { return res.json({ available: false, note: result.note }); }
    return res.json({ available: true, ...result.data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to build collection report' });
  }
}

/**
 * Revenue report.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function revenue(req, res) {
  try {
    const result = await safeReport(() => reportModel.revenue());
    if (!result.ok) { return res.json({ available: false, note: result.note }); }
    return res.json({ available: true, ...result.data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to build revenue report' });
  }
}

/**
 * Environmental impact report.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function environmentalImpact(req, res) {
  try {
    const result = await safeReport(() => reportModel.environmentalImpact());
    if (!result.ok) { return res.json({ available: false, note: result.note }); }
    return res.json({ available: true, estimated: true, ...result.data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to build environmental report' });
  }
}

module.exports = { collectionVolume, revenue, environmentalImpact };
