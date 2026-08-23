/**
 * Auth service — the only place the frontend calls the backend auth
 * endpoints (FR-01 Registration, FR-02 Login). Components must use
 * these functions (usually via AuthContext), never fetch directly.
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

export default { login, register };
