import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Wallet } from 'lucide-react';
import useWasteListings from '../../hooks/useWasteListings';
import useWallet from '../../hooks/useWallet';
import { LISTING_STATUS, formatBdt } from '../../data/wasteListing';
import ActionButton from './ActionButton';

/**
 * Household dashboard home: a short snapshot and shortcuts.
 * @returns {JSX.Element} Overview page.
 */
function HouseholdOverview() {
  const navigate = useNavigate();
  const { listings, loading } = useWasteListings();
  const { availableBdt, pendingBdt } = useWallet();
  const listed = listings.filter((item) => item.status === LISTING_STATUS.LISTED).length;
  const pickups = listings.filter(
    (item) => item.status === LISTING_STATUS.PICKUP_REQUESTED,
  ).length;
  const recent = listings.slice(0, 3);

  return (
    <section>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-leaf">
        Household
      </p>
      <h1 className="mt-2 font-display text-[1.85rem] leading-tight text-ink sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink/65">
        List waste, request a pickup, and track what is waiting for a collector.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:max-w-2xl">
        <div className="rounded-2xl border border-mist bg-white px-4 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
            Open listings
          </dt>
          <dd className="mt-1 font-display text-3xl text-ink">{listed}</dd>
        </div>
        <div className="rounded-2xl border border-mist bg-white px-4 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
            Pickup requested
          </dt>
          <dd className="mt-1 font-display text-3xl text-ink">{pickups}</dd>
        </div>
        <div className="rounded-2xl border border-mist bg-white px-4 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
            Wallet pending
          </dt>
          <dd className="mt-1 font-display text-2xl text-ink">{formatBdt(pendingBdt)}</dd>
        </div>
        <div className="rounded-2xl border border-leaf/30 bg-lime/40 px-4 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest">
            Wallet available
          </dt>
          <dd className="mt-1 font-display text-2xl text-ink">{formatBdt(availableBdt)}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionButton onClick={() => navigate('/household/listings')}>
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Waste listing
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => navigate('/household/wallet')}>
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Wallet
        </ActionButton>
      </div>

      <div className="mt-10 max-w-xl">
        <h2 className="font-display text-xl text-ink">Recent listings</h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink/60">Loading…</p>
        ) : null}
        {!loading && recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink/65">
            Nothing listed yet. Open Waste listing to add your first bag or bin.
          </p>
        ) : null}
        {!loading && recent.length > 0 ? (
          <ul className="mt-3 divide-y divide-mist rounded-2xl border border-mist bg-white">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium text-ink">{item.category}</span>
                <span className="text-ink/60">
                  {item.estimatedWeightKg}
                  {' kg · '}
                  {formatBdt(item.suggestedPriceBdt)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default HouseholdOverview;
