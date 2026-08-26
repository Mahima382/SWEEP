import { LISTING_STATUS, LISTING_STORAGE_KEY } from '../data/wasteListing';
import {
  cancelListing,
  createListing,
  getListings,
  requestPickup,
} from './wasteService';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('wasteService (FR-03 local fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns locally stored listings when the API is not implemented', async () => {
    const existing = [{ id: 'a', category: 'Glass', status: LISTING_STATUS.LISTED }];
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(existing));
    vi.stubGlobal('fetch', mockFetch(501, { message: 'Waste — not implemented yet (FR-03)' }));

    await expect(getListings()).resolves.toEqual(existing);
  });

  it('saves a created listing locally when the API returns 501', async () => {
    vi.stubGlobal('fetch', mockFetch(501, { message: 'Waste — not implemented yet (FR-03)' }));

    const created = await createListing({
      category: 'Metal',
      estimatedWeightKg: 3,
      suggestedPriceBdt: 40,
      photos: ['data:image/png;base64,abc'],
      status: LISTING_STATUS.LISTED,
    });

    expect(created.id).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(LISTING_STORAGE_KEY))[0].category).toBe('Metal');
  });

  it('requests a pickup and stamps pickupRequestedAt', async () => {
    const listed = {
      id: 'listing-1',
      status: LISTING_STATUS.LISTED,
      category: 'Paper',
    };
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify([listed]));
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));

    const updated = await requestPickup('listing-1', {
      pickupDate: '2026-08-27',
      windowStart: '10:00',
      windowEnd: '12:00',
    });

    expect(updated.status).toBe(LISTING_STATUS.PICKUP_REQUESTED);
    expect(updated.pickupRequestedAt).toBeTruthy();
    expect(updated.windowStart).toBe('10:00');
  });

  it('cancels a listed item without a pickup', async () => {
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify([
      { id: 'listing-2', status: LISTING_STATUS.LISTED },
    ]));
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));

    const updated = await cancelListing('listing-2');
    expect(updated.status).toBe(LISTING_STATUS.CANCELLED);
  });

  it('refuses cancel after the 2-hour window', async () => {
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify([
      {
        id: 'listing-3',
        status: LISTING_STATUS.PICKUP_REQUESTED,
        pickupRequestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ]));
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));

    await expect(cancelListing('listing-3')).rejects.toThrow(/2-hour/i);
  });
});
