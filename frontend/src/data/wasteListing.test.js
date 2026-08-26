import {
  LISTING_STATUS,
  buildListingPayload,
  canCancelFree,
  formatBdt,
  todayIsoDate,
  validateListingForm,
  validatePickupSchedule,
} from './wasteListing';

describe('wasteListing helpers (FR-03)', () => {
  it('formats suggested prices in BDT', () => {
    expect(formatBdt(120)).toBe('৳120');
  });

  it('rejects a listing with no category, weight, or price', () => {
    const errors = validateListingForm({
      category: '',
      estimatedWeightKg: '',
      suggestedPriceBdt: '',
      photos: [],
      requestPickupNow: false,
    });
    expect(errors.category).toBeTruthy();
    expect(errors.estimatedWeightKg).toBeTruthy();
    expect(errors.suggestedPriceBdt).toBeTruthy();
    expect(errors.photos).toBeUndefined();
  });

  it('accepts a complete listing without a pickup request', () => {
    const errors = validateListingForm({
      category: 'Plastic',
      subCategory: 'PET',
      estimatedWeightKg: '4.5',
      suggestedPriceBdt: '80',
      photos: ['data:image/png;base64,abc'],
      requestPickupNow: false,
    });
    expect(errors).toEqual({});
  });

  it('requires a future pickup window when a pickup is requested', () => {
    const now = new Date('2026-08-26T10:00:00');
    const errors = validatePickupSchedule({
      pickupDate: '2026-08-25',
      windowStart: '16:00',
      windowEnd: '15:00',
    }, now);
    expect(errors.pickupDate).toMatch(/past/i);
    expect(errors.windowEnd).toMatch(/after/i);
  });

  it('lets a listed item be withdrawn at any time', () => {
    expect(canCancelFree({ status: LISTING_STATUS.LISTED })).toBe(true);
  });

  it('allows free cancel only inside the 2-hour pickup window', () => {
    const requested = new Date('2026-08-26T10:00:00Z');
    const listing = {
      status: LISTING_STATUS.PICKUP_REQUESTED,
      pickupRequestedAt: requested.toISOString(),
    };
    expect(canCancelFree(listing, requested.getTime() + 30 * 60 * 1000)).toBe(true);
    expect(canCancelFree(listing, requested.getTime() + 3 * 60 * 60 * 1000)).toBe(false);
  });

  it('builds a pickup-requested payload when the household schedules on create', () => {
    const now = new Date('2026-08-26T09:00:00Z');
    const payload = buildListingPayload({
      category: 'Paper',
      subCategory: 'Cardboard',
      estimatedWeightKg: '12',
      suggestedPriceBdt: '50',
      photos: ['data:image/png;base64,abc'],
      notes: 'Dry and flattened',
      address: 'House 12, Savar',
      requestPickupNow: true,
      pickupDate: todayIsoDate(now),
      windowStart: '10:00',
      windowEnd: '12:00',
    }, now);
    expect(payload.status).toBe(LISTING_STATUS.PICKUP_REQUESTED);
    expect(payload.pickupRequestedAt).toBe(now.toISOString());
    expect(payload.estimatedWeightKg).toBe(12);
  });
});
