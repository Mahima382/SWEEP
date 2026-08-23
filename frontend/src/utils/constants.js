/**
 * Shared frontend constants. Keep in sync with the backend and SRS §5.
 */

/**
 * The eight waste categories from the SRS (spec §5).
 * Note: E-waste is licence-gated — only visible/orderable by companies
 * holding an e-waste handling licence.
 * @type {string[]}
 */
export const WASTE_CATEGORIES = [
  'Plastic',
  'Paper',
  'Metal',
  'Glass',
  'E-waste',
  'Organic',
  'Textile',
  'Mixed',
];

/**
 * User role identifiers used for role-based routing and RBAC checks.
 * @type {{HOUSEHOLD: string, LOCAL_COLLECTOR: string, GLOBAL_COLLECTOR: string,
 *   COMPANY: string, ADMIN: string}}
 */
export const ROLES = {
  HOUSEHOLD: 'household',
  LOCAL_COLLECTOR: 'local_collector',
  GLOBAL_COLLECTOR: 'global_collector',
  COMPANY: 'company',
  ADMIN: 'admin',
};

export default { WASTE_CATEGORIES, ROLES };
