/**
 * User service — the authenticated user's own profile (FR-01 post-login
 * profile completion, FR-12). Components must use these functions, never
 * fetch directly (MVC boundary: the View never talks to MySQL/SQLite).
 */

import { get, patch } from './api';

/**
 * Fetches the authenticated user's own profile, including whether the
 * post-login profile-completion flow has been finished yet.
 * @returns {Promise<object>} Backend response, expected `{ user }`.
 */
export function getMyProfile() {
  return get('/users/me');
}

/**
 * Saves the role-specific profile-completion data collected after first
 * login (see PROFILE_COMPLETION_SPEC.md).
 * @param {object} profileData Role-specific profile payload (address, NID,
 *   KYC documents, payout, etc. — shape depends on the account's role).
 * @returns {Promise<object>} Backend response, expected `{ user }`.
 */
export function completeProfile(profileData) {
  return patch('/users/me/profile', profileData);
}

export default { getMyProfile, completeProfile };
