/**
 * Auth controller — Registration & Login (FR-01, FR-02).
 * Owns register/login/logout flows for all four roles.
 */

/**
 * Placeholder for user registration (FR-01: Household, Local Collector,
 * Global Collector, Company sub-flows).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function register(req, res) {
  res.status(501).json({ message: 'Auth — not implemented yet (FR-01)' });
}

/**
 * Placeholder for login with role-based routing and 5-attempt lockout (FR-02).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function login(req, res) {
  res.status(501).json({ message: 'Auth — not implemented yet (FR-02)' });
}

module.exports = { register, login };
