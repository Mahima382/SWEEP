/**
 * Shared input validators for auth flows (FR-01, FR-02).
 * Mirrors the client-side rules in frontend/src/components/Auth/RegisterFlow.jsx
 * so the server enforces the same policy at the trust boundary.
 */

const EMAIL_POLICY = /^\S+@\S+\.\S+$/;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const MOBILE_POLICY = /^01[0-9]{9}$/;
const ACCOUNT_TYPES = ['household', 'collector', 'global', 'company'];

/**
 * @param {string} email - Candidate email address.
 * @returns {boolean} True when the email looks valid.
 */
function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_POLICY.test(email.trim());
}

/**
 * @param {string} password - Candidate password.
 * @returns {boolean} True when the password meets the NFR password policy
 *   (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).
 */
function isValidPassword(password) {
  return typeof password === 'string' && PASSWORD_POLICY.test(password);
}

/**
 * @param {string} mobile - Candidate mobile number.
 * @returns {boolean} True when it is an 11-digit Bangladeshi mobile number.
 */
function isValidMobile(mobile) {
  return typeof mobile === 'string' && MOBILE_POLICY.test(mobile.trim());
}

/**
 * @param {string} accountType - Candidate self-service account type.
 * @returns {boolean} True when it is one of the four self-registrable roles.
 */
function isValidRole(accountType) {
  return ACCOUNT_TYPES.includes(accountType);
}

module.exports = {
  isValidEmail, isValidPassword, isValidMobile, isValidRole, ACCOUNT_TYPES,
};
