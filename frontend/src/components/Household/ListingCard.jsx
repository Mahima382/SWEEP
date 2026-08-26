import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CATEGORY_IMAGES,
  LISTING_STATUS,
  STATUS_LABELS,
  canCancelFree,
  formatBdt,
  todayIsoDate,
  validatePickupSchedule,
} from '../../data/wasteListing';
import ActionButton from './ActionButton';
import PickupScheduleFields from './PickupScheduleFields';

/**
 * Compact row for one household waste listing.
 * @param {object} props Component props.
 * @param {object} props.listing Listing to render.
 * @param {Function} props.onRequestPickup Persist a pickup schedule.
 * @param {Function} props.onCancel Withdraw or cancel the listing.
 * @returns {JSX.Element} Listing row.
 */
function ListingCard({ listing, onRequestPickup, onCancel }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState({
    pickupDate: listing.pickupDate || todayIsoDate(),
    windowStart: listing.windowStart || '',
    windowEnd: listing.windowEnd || '',
  });
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const cover = (listing.photos && listing.photos[0]) || CATEGORY_IMAGES[listing.category];
  const cancelled = listing.status === LISTING_STATUS.CANCELLED;
  const listed = listing.status === LISTING_STATUS.LISTED;
  const freeCancel = canCancelFree(listing);

  const submitPickup = async (event) => {
    event.preventDefault();
    const errors = validatePickupSchedule(schedule);
    setScheduleErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await onRequestPickup(listing.id, schedule);
      setScheduleOpen(false);
    } catch (err) {
      setActionError(err.message || 'Could not request pickup.');
    } finally {
      setBusy(false);
    }
  };

  const submitCancel = async () => {
    setBusy(true);
    setActionError('');
    try {
      await onCancel(listing.id);
    } catch (err) {
      setActionError(err.message || 'Could not cancel this listing.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-mist bg-white p-4">
      <div className="flex gap-3">
        <img
          src={cover}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover bg-foam"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl leading-tight text-ink">{listing.category}</h2>
            <span className="rounded-full bg-foam px-2 py-0.5 text-xs font-semibold text-forest">
              {STATUS_LABELS[listing.status] || listing.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/70">
            {listing.estimatedWeightKg}
            {' kg · '}
            {formatBdt(listing.suggestedPriceBdt)}
            {listing.pickupDate ? ` · ${listing.pickupDate}` : ''}
          </p>
        </div>
      </div>

      {actionError ? <p className="mt-2 text-xs text-red-700">{actionError}</p> : null}

      {scheduleOpen && listed ? (
        <form onSubmit={submitPickup} className="mt-4 border-t border-mist pt-4">
          <PickupScheduleFields
            idPrefix={`pickup-${listing.id}`}
            pickupDate={schedule.pickupDate}
            windowStart={schedule.windowStart}
            windowEnd={schedule.windowEnd}
            minDate={todayIsoDate()}
            errors={scheduleErrors}
            onChange={({ name, value }) => {
              setSchedule((current) => ({ ...current, [name]: value }));
            }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton type="submit" disabled={busy} className="!px-4 !py-2">
              {busy ? 'Sending…' : 'Confirm pickup'}
            </ActionButton>
            <ActionButton variant="ghost" className="!px-4 !py-2" onClick={() => setScheduleOpen(false)}>
              Back
            </ActionButton>
          </div>
        </form>
      ) : null}

      {!cancelled && !scheduleOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {listed ? (
            <ActionButton className="!px-4 !py-2" onClick={() => setScheduleOpen(true)}>
              Request pickup
            </ActionButton>
          ) : null}
          {freeCancel ? (
            <ActionButton
              variant="ghost"
              className="!px-4 !py-2"
              disabled={busy}
              onClick={submitCancel}
            >
              {listed ? 'Remove' : 'Cancel pickup'}
            </ActionButton>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

ListingCard.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    estimatedWeightKg: PropTypes.number,
    suggestedPriceBdt: PropTypes.number,
    photos: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
    pickupDate: PropTypes.string,
    windowStart: PropTypes.string,
    windowEnd: PropTypes.string,
  }).isRequired,
  onRequestPickup: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ListingCard;
