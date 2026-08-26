/**
 * Waste listing service — the only place the View calls FR-03 endpoints.
 * When the backend still returns 501 (or is offline), listings persist in
 * localStorage so the household UI can be used and demonstrated.
 */

import { get, post, request } from './api';
import {
  LISTING_STATUS,
  LISTING_STORAGE_KEY,
  canCancelFree,
} from '../data/wasteListing';

/**
 * Whether the waste API is missing, stubbed, or unreachable.
 * @param {Error} error Error thrown by `request`.
 * @returns {boolean} True when the client should use local listings.
 */
function isApiUnavailable(error) {
  if (!error) {
    return true;
  }
  if (typeof error.status === 'undefined') {
    return true;
  }
  return error.status === 404 || error.status === 501 || error.status >= 500;
}

/**
 * Read locally saved household listings.
 * @returns {object[]} Stored listings, or an empty array.
 */
function readLocalListings() {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(LISTING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (parseError) {
    return [];
  }
}

/**
 * Persist household listings locally.
 * @param {object[]} listings Listings to store.
 * @returns {void}
 */
function writeLocalListings(listings) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(listings));
}

/**
 * Create a unique listing id for the local fallback.
 * @returns {string} New listing id.
 */
function createListingId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `listing-${Date.now()}`;
}

/**
 * Fetch the household's waste listings (FR-03).
 * @returns {Promise<object[]>} Current listings.
 */
export async function getListings() {
  try {
    const body = await get('/waste/listings');
    if (Array.isArray(body)) {
      return body;
    }
    return body.listings || [];
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }
    return readLocalListings();
  }
}

/**
 * Create a new household waste listing (FR-03).
 * @param {object} listing Listing fields from the create form.
 * @returns {Promise<object>} The created listing, including an id.
 */
export async function createListing(listing) {
  try {
    return await post('/waste/listings', listing);
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }
    const created = {
      ...listing,
      id: createListingId(),
    };
    writeLocalListings([created, ...readLocalListings()]);
    return created;
  }
}

/**
 * Request a collector pickup with a scheduled window (FR-03).
 * @param {string} id Listing id.
 * @param {{pickupDate: string, windowStart: string, windowEnd: string}} schedule Pickup window.
 * @returns {Promise<object>} Updated listing.
 */
export async function requestPickup(id, schedule) {
  const patch = {
    ...schedule,
    status: LISTING_STATUS.PICKUP_REQUESTED,
    pickupRequestedAt: new Date().toISOString(),
  };
  try {
    return await request(`/waste/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }
    const listings = readLocalListings();
    const current = listings.find((item) => item.id === id);
    if (!current) {
      throw new Error('Listing not found.');
    }
    if (current.status !== LISTING_STATUS.LISTED) {
      throw new Error('Pickup can only be requested for an open listing.');
    }
    const updated = { ...current, ...patch };
    writeLocalListings(listings.map((item) => (item.id === id ? updated : item)));
    return updated;
  }
}

/**
 * Cancel a listing or pickup request inside the FR-03 free-cancel window.
 * @param {string} id Listing id.
 * @returns {Promise<object>} Updated listing.
 */
export async function cancelListing(id) {
  try {
    return await request(`/waste/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: LISTING_STATUS.CANCELLED }),
    });
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }
    const listings = readLocalListings();
    const current = listings.find((item) => item.id === id);
    if (!current) {
      throw new Error('Listing not found.');
    }
    if (!canCancelFree(current)) {
      throw new Error('The 2-hour free cancellation window has closed.');
    }
    const updated = {
      ...current,
      status: LISTING_STATUS.CANCELLED,
      cancelledAt: new Date().toISOString(),
    };
    writeLocalListings(listings.map((item) => (item.id === id ? updated : item)));
    return updated;
  }
}

export default {
  getListings,
  createListing,
  requestPickup,
  cancelListing,
};
