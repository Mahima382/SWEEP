import React, { useState } from 'react';
import { Plus, Recycle } from 'lucide-react';
import useWasteListings from '../../hooks/useWasteListings';
import ActionButton from './ActionButton';
import CreateListingForm from './CreateListingForm';
import ListingCard from './ListingCard';

/**
 * Simple household waste listing page (FR-03).
 * @returns {JSX.Element} List + add form.
 */
function WasteListings() {
  const {
    listings,
    loading,
    error,
    createListing,
    requestPickup,
    cancelListing,
  } = useWasteListings();
  const [formOpen, setFormOpen] = useState(false);

  const handleCreate = async (payload) => {
    await createListing(payload);
    setFormOpen(false);
  };

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-leaf">
            Household
          </p>
          <h1 className="mt-2 font-display text-[1.85rem] leading-tight text-ink sm:text-4xl">
            Waste listing
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink/65">
            Tell us what you have. A collector can pick it up from your home.
          </p>
        </div>
        <ActionButton
          variant={formOpen ? 'ghost' : 'forest'}
          onClick={() => setFormOpen((open) => !open)}
        >
          {formOpen ? 'Close' : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add waste
            </>
          )}
        </ActionButton>
      </div>

      {formOpen ? (
        <div className="mt-6 max-w-xl">
          <CreateListingForm
            onCreate={handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-ink/60">Loading…</p>
      ) : null}

      {!loading && listings.length === 0 && !formOpen ? (
        <div className="mt-10 flex max-w-xl flex-col items-center rounded-[1.75rem] border border-dashed border-leaf/40 bg-white px-6 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-forest">
            <Recycle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-ink">No waste listed</h2>
          <p className="mt-2 text-sm text-ink/65">
            Add a category, weight, and price. Photos are optional.
          </p>
          <div className="mt-5">
            <ActionButton onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add waste
            </ActionButton>
          </div>
        </div>
      ) : null}

      {!loading && listings.length > 0 ? (
        <ul className="mt-8 max-w-2xl space-y-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard
                listing={listing}
                onRequestPickup={requestPickup}
                onCancel={cancelListing}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default WasteListings;
