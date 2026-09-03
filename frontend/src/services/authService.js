/**
 * Auth service — the only place the frontend calls the backend auth
 * endpoints (FR-01 Registration, FR-02 Login, FR-12 password reset).
 * Components must use these functions (usually via AuthContext), never
 * fetch directly.
 */

import { post } from './api';

/**
 * Log a user in with email and password.
 * @param {string} email User's email address.
 * @param {string} password User's password.
 * @returns {Promise<object>} Backend response, expected `{ token, user }`.
 */
export function login(email, password) {
  return post('/auth/login', { email, password });
}

/**
 * Register a new account for any of the four roles.
 * @param {object} registrationData Role-specific registration payload
 *   (e.g. `{ role, name, email, password, nid, ... }`).
 * @returns {Promise<object>} Backend response, expected `{ user }`.
 */
export function register(registrationData) {
  return post('/auth/register', registrationData);
}

/**
 * Requests a password-reset link for an account (FR-12). Always resolves
 * with a generic confirmation, regardless of whether the email is
 * registered — never surface that distinction in the UI.
 * @param {string} email Account email address.
 * @returns {Promise<object>} Backend response, `{ message }` (plus a
 *   `resetToken` in this project's no-email-provider dev setup — see
 *   authController.js#forgotPassword).
 */
export function forgotPassword(email) {
  return post('/auth/forgot-password', { email });
}

/**
 * Completes a password reset with the token issued by forgotPassword.
 * @param {string} token Reset token from the reset link.
 * @param {string} password New password.
 * @returns {Promise<object>} Backend response, expected `{ message }`.
 */
export function resetPassword(token, password) {
  return post('/auth/reset-password', { token, password });
}

export default {
  login, register, forgotPassword, resetPassword,
};
