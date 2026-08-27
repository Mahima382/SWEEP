/**
 * Operational report model (FR-11 §5). Model layer only: no Express imports, SQL
 * via the shared pool. All aggregations read from the existing data stores
 * (listings, orders, transactions, subscriptions). Where a required column does
 * not yet exist in the shared schema, the controller degrades gracefully and the
 * missing field is documented in the DB-requirements section — no fabricated data.
 */

const db = require('../config/db');

/**
 * Collection volume grouped by waste category and by region.
 *
 * @returns {Promise<object>} { byCategory, byRegion }.
 */
async function collectionVolume() {
  const [byCategory] = await db.query(
    `SELECT waste_category, COUNT(*) AS listings, COALESCE(SUM(weight), 0) AS total_weight
     FROM listings GROUP BY waste_category ORDER BY total_weight DESC`,
  );
  const [byRegion] = await db.query(
    `SELECT u.region, COUNT(*) AS listings, COALESCE(SUM(l.weight), 0) AS total_weight
     FROM listings l JOIN users u ON u.id = l.user_id
     GROUP BY u.region ORDER BY total_weight DESC`,
  );
  return { byCategory, byRegion };
}

/**
 * Revenue grouped by commission and by subscription.
 *
 * @returns {Promise<object>} { commission, subscription }.
 */
async function revenue() {
  const [commission] = await db.query(
    `SELECT COALESCE(SUM(commission_amount), 0) AS total
     FROM transactions WHERE type = 'commission'`,
  );
  const [subscription] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM subscriptions WHERE status = 'active'`,
  );
  return {
    commission: commission[0] ? commission[0].total : 0,
    subscription: subscription[0] ? subscription[0].total : 0,
  };
}

/**
 * Environmental impact (CO2 savings). Derived from collected weight using
 * documented average emission factors per category. A precise figure requires a
 * `co2_factors` reference table (see DB-requirements); until then an estimated
 * factor map is applied and flagged as estimated.
 *
 * @returns {Promise<object>} { byCategory, totalEstimatedCO2, estimated }.
 */
async function environmentalImpact() {
  // Estimated kg CO2 saved per kg recycled, by category. Replace with a real
  // co2_factors table once the shared schema is finalised.
  const ESTIMATED_FACTORS = {
    Plastic: 2.5,
    Paper: 1.2,
    Metal: 9.0,
    Glass: 0.6,
    'E-waste': 15.0,
    Organic: 0.5,
    Textile: 3.0,
    Mixed: 1.5,
  };
  const [rows] = await db.query(
    `SELECT waste_category, COALESCE(SUM(weight), 0) AS total_weight
     FROM listings GROUP BY waste_category`,
  );
  let totalEstimatedCO2 = 0;
  const byCategory = rows.map((r) => {
    const factor = ESTIMATED_FACTORS[r.waste_category] || 1.0;
    const co2 = Number(r.total_weight) * factor;
    totalEstimatedCO2 += co2;
    return { wasteCategory: r.waste_category, totalWeight: r.total_weight, estimatedCO2: co2 };
  });
  return { byCategory, totalEstimatedCO2, estimated: true };
}

module.exports = { collectionVolume, revenue, environmentalImpact };
