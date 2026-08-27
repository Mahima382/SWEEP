/**
 * Pricing & commission controller (FR-11 §1). Admin Portal.
 * Configures versioned base prices (per waste category + region) and versioned
 * commission rates (per transaction type). Overlapping effective dates are
 * rejected. Past transactions retain their applied rate because the rate used
 * at transaction time is snapshotted into the transaction row (see reportModel /
 * DB-requirements doc), not re-derived from the live version table.
 */

const pricingModel = require('../models/pricingModel');
const { WASTE_CATEGORIES } = require('../utils/constants');

/**
 * Validates a non-negative number field.
 *
 * @param {number} value - The value to check.
 * @param {string} name - Field name for the error.
 * @returns {void}
 * @throws {Error} If invalid.
 */
function assertNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    const err = new Error(`${name} must be a non-negative number`);
    err.status = 400;
    throw err;
  }
}

/**
 * Creates a new versioned base-price record.
 *
 * @param {object} req - Express request body: wasteCategory, region, basePriceMin,
 *   basePriceMax, effectiveDate.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function createPriceVersion(req, res) {
  try {
    const {
      wasteCategory, region, basePriceMin, basePriceMax, effectiveDate,
    } = req.body;

    if (!WASTE_CATEGORIES.includes(wasteCategory)) {
      return res.status(400).json({ error: 'Invalid wasteCategory' });
    }
    if (!region || !effectiveDate) {
      return res.status(400).json({ error: 'region and effectiveDate are required' });
    }
    assertNonNegativeNumber(basePriceMin, 'basePriceMin');
    assertNonNegativeNumber(basePriceMax, 'basePriceMax');
    if (basePriceMin > basePriceMax) {
      return res.status(400).json({ error: 'basePriceMin cannot exceed basePriceMax' });
    }

    const created = await pricingModel.createPriceVersion({
      wasteCategory, region, basePriceMin, basePriceMax, effectiveDate,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to create price version' });
  }
}

/**
 * Lists price versions with optional filters.
 *
 * @param {object} req - Express request query: wasteCategory, region.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listPriceVersions(req, res) {
  try {
    const { wasteCategory, region } = req.query;
    const rows = await pricingModel.listPriceVersions({ wasteCategory, region });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list price versions' });
  }
}

/**
 * Creates a new versioned commission rate.
 *
 * @param {object} req - Express request body: transactionType, commissionRate,
 *   effectiveDate.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function createCommissionVersion(req, res) {
  try {
    const { transactionType, commissionRate, effectiveDate } = req.body;

    if (!transactionType || !effectiveDate) {
      return res.status(400).json({ error: 'transactionType and effectiveDate are required' });
    }
    assertNonNegativeNumber(commissionRate, 'commissionRate');
    if (commissionRate > 1) {
      return res.status(400).json({ error: 'commissionRate must be a fraction between 0 and 1' });
    }

    const created = await pricingModel.createCommissionVersion({
      transactionType, commissionRate, effectiveDate,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Failed to create commission version' });
  }
}

/**
 * Lists commission versions with optional filters.
 *
 * @param {object} req - Express request query: transactionType.
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listCommissionVersions(req, res) {
  try {
    const { transactionType } = req.query;
    const rows = await pricingModel.listCommissionVersions({ transactionType });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to list commission versions' });
  }
}

module.exports = {
  createPriceVersion,
  listPriceVersions,
  createCommissionVersion,
  listCommissionVersions,
};
