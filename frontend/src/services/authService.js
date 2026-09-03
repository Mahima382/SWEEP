/**
 * Auth service — the only place the frontend calls the backend auth
 * endpoints (FR-01 Registration, FR-02 Login, FR-12 Password Reset).
 * Components must use these functions (usually via AuthContext),
 * never fetch directly.
 */

import { post } from './api';

/**
 * Log a user in with email and password.
 * @param {string} email User's email address.
 * @param {string} password User's password.
 * @param {boolean} [rememberMe] Whether to persist session for 30 days.
 * @returns {Promise<object>} Backend response, expected `{ token, role }`.
 */
export function login(email, password, rememberMe = false) {
  return post('/auth/login', { email, password, rememberMe });
}

/**
 * Register a new account for any of the four roles.
 * @param {object} registrationData Role-specific registration payload
 *   (e.g. `{ role, name, email, password, nid, ... }`).
 * @returns {Promise<object>} Backend response, expected `{ message }`.
 */
export function register(registrationData) {
  return post('/auth/register', registrationData);
}

/**
 * Request a password reset link (FR-12).
 * @param {string} email User's email address.
 * @returns {Promise<object>} Backend response, expected `{ message }`.
 */
export function forgotPassword(email) {
  return post('/auth/forgot-password', { email });
}

/**
 * Reset a password using a token from email (FR-12).
 * @param {string} email User's email address.
 * @param {string} token Reset token from the URL.
 * @param {string} newPassword The new password.
 * @returns {Promise<object>} Backend response, expected `{ message }`.
 */
export function resetPassword(email, token, newPassword) {
  return post('/auth/reset-password', { email, token, newPassword });
}

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
};
