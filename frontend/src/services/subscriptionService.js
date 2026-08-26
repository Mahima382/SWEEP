/**
 * Subscription service — the only place the frontend calls the backend
 * subscription endpoints (FR-07). Company domain, part of the Company
 * dashboard alongside the future FR-08 newsfeed/procurement service.
 *
 * These endpoints are authenticated (company role). Once FR-02 Login
 * persists its JWT, it should be stored under the `sweep_token` key used
 * here so requests are sent as `Authorization: Bearer <token>`.
 */

import { get, post } from './api';

const TOKEN_STORAGE_KEY = 'sweep_token';

/**
 * Builds the Authorization header from the persisted JWT, if any.
 * @returns {object} `{ Authorization }` when a token is stored, else `{}`.
 */
function authHeaders() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

/**
 * Lists the subscription plans a company can currently choose from.
 * @returns {Promise<{plans: object[]}>} The active plan list.
 */
export function getPlans() {
  return get('/subscriptions/plans', authHeaders());
}

/**
 * Fetches the authenticated company's current subscription, if any.
 * @returns {Promise<{subscription: (object|null)}>} The subscription, with its effective status.
 */
export function getMySubscription() {
  return get('/subscriptions/me', authHeaders());
}

/**
 * Subscribes to a plan (first-time activation) or schedules a plan change
 * for the next renewal if the company is already subscribed.
 * @param {object} payload Subscription payload.
 * @param {number} payload.planId The chosen plan's id.
 * @param {string} payload.billingCycle 'monthly' or 'annual'.
 * @param {string} [payload.paymentMethod] 'bkash' | 'nagad' | 'bank_transfer'.
 * @param {string} [payload.paymentReference] Gateway transaction reference, if any.
 * @returns {Promise<object>} Backend response with the resulting subscription and invoice.
 */
export function subscribe(payload) {
  return post('/subscriptions/subscribe', payload, authHeaders());
}

/**
 * Processes a renewal payment for the company's current subscription.
 * @param {object} [payload] Renewal payload.
 * @param {string} [payload.paymentMethod] 'bkash' | 'nagad' | 'bank_transfer'.
 * @param {string} [payload.paymentReference] Gateway transaction reference, if any.
 * @param {boolean} [payload.paymentSucceeded] For simulating a failed renewal in dev/testing.
 * @returns {Promise<object>} Backend response with the resulting subscription and invoice.
 */
export function renewSubscription(payload = {}) {
  return post('/subscriptions/renew', payload, authHeaders());
}

export default {
  getPlans, getMySubscription, subscribe, renewSubscription,
};
