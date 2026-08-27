/**
 * Pricing & commission model (FR-11 §1). Model layer only: no Express imports,
 * SQL via the shared pool. Both base prices and commission rates are versioned by
 * effective date; a version is active from its effective date until the next
 * version's effective date. Overlapping effective periods are rejected on insert.
 */

const db = require('../config/db');

/**
 * Rejects if an overlapping version already exists for the same key.
 *
 * @param {string} table - Table name ('pricing_versions' | 'commission_versions').
 * @param {string} keyColumn - The scoping column (e.g. 'category_region').
 * @param {string} keyValue - The scoping value.
 * @param {string} effectiveDate - Candidate effective date (YYYY-MM-DD).
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<boolean>} True if an overlap exists.
 */
async function hasOverlap(table, keyColumn, keyValue, effectiveDate, connection) {
  const cx = connection || db;
  const [rows] = await cx.query(
    `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${keyColumn} = ? AND effective_date >= ?`,
    [keyValue, effectiveDate],
  );
  return rows[0].cnt > 0;
}

/**
 * Creates a versioned base-price record for a waste category + region.
 *
 * @param {object} price - Price version.
 * @param {string} price.wasteCategory - One of WASTE_CATEGORIES.
 * @param {string} price.region - Region key.
 * @param {number} price.basePriceMin - Minimum base price.
 * @param {number} price.basePriceMax - Maximum base price.
 * @param {string} price.effectiveDate - Effective date (YYYY-MM-DD).
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<object>} Created row (id + effectiveDate).
 */
async function createPriceVersion(price, connection) {
  const cx = connection || db;
  const key = `${price.wasteCategory}::${price.region}`;
  if (await hasOverlap('pricing_versions', 'category_region', key, price.effectiveDate, cx)) {
    const err = new Error('Overlapping effective date: a version already begins on or after this date');
    err.status = 409;
    throw err;
  }
  const [result] = await cx.query(
    `INSERT INTO pricing_versions
       (category_region, waste_category, region, base_price_min, base_price_max, effective_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      key,
      price.wasteCategory,
      price.region,
      price.basePriceMin,
      price.basePriceMax,
      price.effectiveDate,
    ],
  );
  return {
    id: result.insertId,
    wasteCategory: price.wasteCategory,
    region: price.region,
    basePriceMin: price.basePriceMin,
    basePriceMax: price.basePriceMax,
    effectiveDate: price.effectiveDate,
  };
}

/**
 * Lists price versions, optionally filtered by category/region.
 *
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.wasteCategory] - Filter by category.
 * @param {string} [filters.region] - Filter by region.
 * @returns {Promise<object[]>} Price version rows (newest effective date first).
 */
async function listPriceVersions(filters = {}) {
  const conditions = [];
  const params = [];
  if (filters.wasteCategory) {
    conditions.push('waste_category = ?');
    params.push(filters.wasteCategory);
  }
  if (filters.region) {
    conditions.push('region = ?');
    params.push(filters.region);
  }
  let query = `SELECT id, waste_category, region, base_price_min, base_price_max, effective_date
    FROM pricing_versions`;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY effective_date DESC';
  const [rows] = await db.query(query, params);
  return rows;
}

/**
 * Returns the active price version for a category+region as of a date.
 *
 * @param {string} wasteCategory - Waste category.
 * @param {string} region - Region key.
 * @param {string} [asOf] - Reference date (YYYY-MM-DD); defaults to today.
 * @returns {Promise<object|null>} Active version or null if none effective yet.
 */
async function getActivePriceVersion(wasteCategory, region, asOf) {
  const asOfDate = asOf || new Date().toISOString().slice(0, 10);
  const key = `${wasteCategory}::${region}`;
  const [rows] = await db.query(
    `SELECT id, waste_category, region, base_price_min, base_price_max, effective_date
     FROM pricing_versions
     WHERE category_region = ? AND effective_date <= ?
     ORDER BY effective_date DESC LIMIT 1`,
    [key, asOfDate],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Creates a versioned commission rate for a transaction type.
 *
 * @param {object} commission - Commission version.
 * @param {string} commission.transactionType - e.g. 'pickup', 'order'.
 * @param {number} commission.commissionRate - Rate as a fraction (0.05 = 5%).
 * @param {string} commission.effectiveDate - Effective date (YYYY-MM-DD).
 * @param {object} [connection] - Optional live DB connection.
 * @returns {Promise<object>} Created row.
 */
async function createCommissionVersion(commission, connection) {
  const cx = connection || db;
  if (await hasOverlap('commission_versions', 'transaction_type', commission.transactionType, commission.effectiveDate, cx)) {
    const err = new Error('Overlapping effective date: a version already begins on or after this date');
    err.status = 409;
    throw err;
  }
  const [result] = await cx.query(
    `INSERT INTO commission_versions (transaction_type, commission_rate, effective_date)
     VALUES (?, ?, ?)`,
    [commission.transactionType, commission.commissionRate, commission.effectiveDate],
  );
  return {
    id: result.insertId,
    transactionType: commission.transactionType,
    commissionRate: commission.commissionRate,
    effectiveDate: commission.effectiveDate,
  };
}

/**
 * Lists commission versions, optionally filtered by transaction type.
 *
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.transactionType] - Filter by transaction type.
 * @returns {Promise<object[]>} Commission version rows (newest first).
 */
async function listCommissionVersions(filters = {}) {
  const conditions = [];
  const params = [];
  if (filters.transactionType) {
    conditions.push('transaction_type = ?');
    params.push(filters.transactionType);
  }
  let query = `SELECT id, transaction_type, commission_rate, effective_date
    FROM commission_versions`;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY effective_date DESC';
  const [rows] = await db.query(query, params);
  return rows;
}

/**
 * Returns the active commission rate for a transaction type as of a date.
 *
 * @param {string} transactionType - Transaction type.
 * @param {string} [asOf] - Reference date (YYYY-MM-DD); defaults to today.
 * @returns {Promise<object|null>} Active commission version or null.
 */
async function getActiveCommissionVersion(transactionType, asOf) {
  const asOfDate = asOf || new Date().toISOString().slice(0, 10);
  const [rows] = await db.query(
    `SELECT id, transaction_type, commission_rate, effective_date
     FROM commission_versions
     WHERE transaction_type = ? AND effective_date <= ?
     ORDER BY effective_date DESC LIMIT 1`,
    [transactionType, asOfDate],
  );
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  createPriceVersion,
  listPriceVersions,
  getActivePriceVersion,
  createCommissionVersion,
  listCommissionVersions,
  getActiveCommissionVersion,
};
