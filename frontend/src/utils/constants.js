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

/**
 * Where each role lands after login/profile completion (FR-02 role-based
 * routing). Keyed by the role values actually used across auth (household |
 * collector | global | company | admin), not the ROLES constant above.
 * @type {{household: string, collector: string, global: string,
 *   company: string, admin: string}}
 */
export const ROLE_DASHBOARD_ROUTES = {
  household: '/household',
  collector: '/collector',
  global: '/collector',
  company: '/company',
  admin: '/admin',
};

/**
 * Roles whose account stays pending until an admin approves KYC (locked
 * registration rules, CLAUDE.md §5) — mirrors
 * backend/controllers/authController.js#KYC_PENDING_ROLES.
 * @type {string[]}
 */
export const KYC_PENDING_ROLES = ['collector', 'global', 'company'];

export default {
  WASTE_CATEGORIES, ROLES, ROLE_DASHBOARD_ROUTES, KYC_PENDING_ROLES,
};
