/**
 * Shared backend constants.
 */

/**
 * The eight waste categories from SRS FR-03 (spec §5).
 * E-waste is licence-gated: only visible/orderable by companies holding
 * an e-waste handling licence.
 *
 * @type {string[]}
 */
const WASTE_CATEGORIES = [
  'Plastic',
  'Paper',
  'Metal',
  'Glass',
  'E-waste',
  'Organic',
  'Textile',
  'Mixed',
];

module.exports = { WASTE_CATEGORIES };
