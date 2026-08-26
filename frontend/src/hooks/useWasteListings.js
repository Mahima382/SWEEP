import { useCallback, useEffect, useState } from 'react';
import {
  cancelListing as cancelListingRequest,
  createListing as createListingRequest,
  getListings,
  requestPickup as requestPickupRequest,
} from '../services/wasteService';

/**
 * Loads and mutates the signed-in household's waste listings (FR-03).
 * @returns {{
 *   listings: object[],
 *   loading: boolean,
 *   error: (string|null),
 *   refresh: Function,
 *   createListing: Function,
 *   requestPickup: Function,
 *   cancelListing: Function,
 * }} Listing state and actions.
 */
export default function useWasteListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getListings();
      setListings(next);
    } catch (err) {
      setError(err.message || 'Could not load listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createListing = useCallback(async (payload) => {
    const created = await createListingRequest(payload);
    setListings((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    return created;
  }, []);

  const requestPickup = useCallback(async (id, schedule) => {
    const updated = await requestPickupRequest(id, schedule);
    setListings((current) => current.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const cancelListing = useCallback(async (id) => {
    const updated = await cancelListingRequest(id);
    setListings((current) => current.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  return {
    listings,
    loading,
    error,
    refresh,
    createListing,
    requestPickup,
    cancelListing,
  };
}
