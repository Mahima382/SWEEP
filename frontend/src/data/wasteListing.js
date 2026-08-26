/**
 * FR-03 household waste listing helpers: categories, validation, and
 * the 2-hour free cancellation window.
 */

export const MAX_PHOTOS = 5;

export const FREE_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

export const LISTING_STORAGE_KEY = 'sweep.household.listings.v1';

export const LISTING_STATUS = {
  LISTED: 'listed',
  PICKUP_REQUESTED: 'pickupRequested',
  CANCELLED: 'cancelled',
};

export const CATEGORY_SUBTYPES = {
  Plastic: ['PET', 'HDPE', 'LDPE', 'PP', 'PS', 'Other plastic'],
  Paper: ['Newspaper', 'Cardboard', 'Office paper', 'Magazines', 'Mixed paper'],
  Metal: ['Aluminium', 'Steel', 'Copper', 'Mixed metal'],
  Glass: ['Clear', 'Green', 'Brown', 'Mixed glass'],
  'E-waste': ['Phones', 'Batteries', 'Appliances', 'Cables', 'Other e-waste'],
  Organic: ['Food scraps', 'Garden waste', 'Mixed organic'],
  Textile: ['Clothing', 'Fabric scraps', 'Mixed textile'],
  Mixed: ['Mixed recyclables'],
};

export const CATEGORY_IMAGES = {
  Plastic: '/images/bottles.jpg',
  Paper: '/images/paper.jpg',
  Metal: '/images/cans.jpg',
  Glass: '/images/glass.jpg',
  'E-waste': '/images/ewaste.jpg',
  Organic: '/images/organic.jpg',
  Textile: '/images/textiles.jpg',
  Mixed: '/images/sorted-bins.jpg',
};

export const STATUS_LABELS = {
  [LISTING_STATUS.LISTED]: 'Listed',
  [LISTING_STATUS.PICKUP_REQUESTED]: 'Pickup requested',
  [LISTING_STATUS.CANCELLED]: 'Cancelled',
};

export const PICKUP_WINDOWS = [
  {
    id: 'morning',
    label: 'Morning',
    hint: '8 am – 12 pm',
    start: '08:00',
    end: '12:00',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    hint: '12 – 4 pm',
    start: '12:00',
    end: '16:00',
  },
  {
    id: 'evening',
    label: 'Evening',
    hint: '4 – 7 pm',
    start: '16:00',
    end: '19:00',
  },
];

/**
 * Today's date as YYYY-MM-DD in the local timezone.
 * @param {Date} [now] Clock to read; defaults to the system time.
 * @returns {string} ISO date string without the time part.
 */
export function todayIsoDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a numeric amount as Bangladeshi Taka for display.
 * @param {number|string} amount Suggested price.
 * @returns {string} Display string such as `৳120`.
 */
export function formatBdt(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '৳0';
  }
  return `৳${Math.round(value).toLocaleString('en-BD')}`;
}

/**
 * Deadline after which a pickup request can no longer be cancelled for free.
 * @param {object} listing Listing with `pickupRequestedAt`.
 * @returns {(Date|null)} Deadline, or null when no pickup has been requested.
 */
export function getCancelDeadline(listing) {
  if (!listing || !listing.pickupRequestedAt) {
    return null;
  }
  const requested = new Date(listing.pickupRequestedAt).getTime();
  if (Number.isNaN(requested)) {
    return null;
  }
  return new Date(requested + FREE_CANCEL_WINDOW_MS);
}

/**
 * Whether the household can still cancel this listing without a fee (FR-03).
 * Listed items (no pickup yet) can always be withdrawn. Pickup requests can
 * be cancelled for free only inside the 2-hour window.
 * @param {object} listing Listing to inspect.
 * @param {number} [nowMs] Epoch millis; defaults to Date.now().
 * @returns {boolean} True when cancel/withdraw is still allowed.
 */
export function canCancelFree(listing, nowMs = Date.now()) {
  if (!listing || listing.status === LISTING_STATUS.CANCELLED) {
    return false;
  }
  if (listing.status === LISTING_STATUS.LISTED) {
    return true;
  }
  if (listing.status !== LISTING_STATUS.PICKUP_REQUESTED) {
    return false;
  }
  const deadline = getCancelDeadline(listing);
  return Boolean(deadline && nowMs <= deadline.getTime());
}

/**
 * Milliseconds remaining in the free-cancel window, or null if none applies.
 * @param {object} listing Listing to inspect.
 * @param {number} [nowMs] Epoch millis; defaults to Date.now().
 * @returns {(number|null)} Remaining ms, 0 if elapsed, null if not applicable.
 */
export function cancelWindowRemainingMs(listing, nowMs = Date.now()) {
  const deadline = getCancelDeadline(listing);
  if (!deadline) {
    return null;
  }
  return Math.max(0, deadline.getTime() - nowMs);
}

/**
 * Validate a pickup date and time window.
 * @param {{pickupDate?: string, windowStart?: string, windowEnd?: string}} values Schedule fields.
 * @param {Date} [now] Clock to read for "today".
 * @returns {object} Field-keyed error messages; empty when valid.
 */
export function validatePickupSchedule(values, now = new Date()) {
  const errors = {};
  if (!values.pickupDate) {
    errors.pickupDate = 'Pick a collection date.';
  } else if (values.pickupDate < todayIsoDate(now)) {
    errors.pickupDate = 'Pickup date cannot be in the past.';
  }
  if (!values.windowStart || !values.windowEnd) {
    errors.windowStart = 'Pick morning, afternoon, or evening.';
  } else if (values.windowEnd <= values.windowStart) {
    errors.windowEnd = 'End time must be after the start time.';
  }
  return errors;
}

/**
 * Validate the create-listing form against FR-03 rules.
 * @param {object} values Form values.
 * @param {Date} [now] Clock used when a pickup is requested on create.
 * @returns {object} Field-keyed error messages; empty when valid.
 */
export function validateListingForm(values, now = new Date()) {
  const errors = {};
  if (!values.category) {
    errors.category = 'Choose a waste category.';
  }
  const weight = Number(values.estimatedWeightKg);
  if (values.estimatedWeightKg === '' || values.estimatedWeightKg === null || values.estimatedWeightKg === undefined) {
    errors.estimatedWeightKg = 'Enter a weight greater than 0 kg.';
  } else if (!Number.isFinite(weight) || weight <= 0) {
    errors.estimatedWeightKg = 'Enter a weight greater than 0 kg.';
  }
  const price = Number(values.suggestedPriceBdt);
  if (values.suggestedPriceBdt === '' || values.suggestedPriceBdt === null || values.suggestedPriceBdt === undefined) {
    errors.suggestedPriceBdt = 'Enter a suggested price of 0 BDT or more.';
  } else if (!Number.isFinite(price) || price < 0) {
    errors.suggestedPriceBdt = 'Enter a suggested price of 0 BDT or more.';
  }
  const photos = Array.isArray(values.photos) ? values.photos : [];
  if (photos.length > MAX_PHOTOS) {
    errors.photos = `You can attach at most ${MAX_PHOTOS} photos.`;
  }
  if (values.requestPickupNow) {
    Object.assign(errors, validatePickupSchedule(values, now));
  }
  return errors;
}

/**
 * Build the listing payload stored locally / sent to the API.
 * @param {object} values Validated form values.
 * @param {Date} [now] Timestamp source.
 * @returns {object} Listing fields without an id.
 */
export function buildListingPayload(values, now = new Date()) {
  const createdAt = now.toISOString();
  const requestPickupNow = Boolean(values.requestPickupNow);
  return {
    category: values.category,
    subCategory: values.subCategory || null,
    estimatedWeightKg: Number(values.estimatedWeightKg),
    suggestedPriceBdt: Number(values.suggestedPriceBdt),
    photos: values.photos.slice(0, MAX_PHOTOS),
    notes: (values.notes || '').trim(),
    address: (values.address || '').trim(),
    status: requestPickupNow ? LISTING_STATUS.PICKUP_REQUESTED : LISTING_STATUS.LISTED,
    pickupDate: requestPickupNow ? values.pickupDate : null,
    windowStart: requestPickupNow ? values.windowStart : null,
    windowEnd: requestPickupNow ? values.windowEnd : null,
    pickupRequestedAt: requestPickupNow ? createdAt : null,
    createdAt,
    cancelledAt: null,
  };
}
