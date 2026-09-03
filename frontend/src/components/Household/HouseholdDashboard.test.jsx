import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HouseholdDashboard from './HouseholdDashboard';
import { LISTING_STATUS, LISTING_STORAGE_KEY } from '../../data/wasteListing';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  });
}

/**
 * Render the household area at a nested path.
 * @param {string} path Path under /household, e.g. `/household/listings`.
 * @returns {object} RTL render result.
 */
function renderHousehold(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/household/*" element={<HouseholdDashboard />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HouseholdDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', mockFetch(501, { message: 'Waste — not implemented yet (FR-03)' }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the dashboard overview with a sidebar', async () => {
    renderHousehold('/household');

    expect(screen.getByRole('heading', { name: /^Dashboard$/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Waste listing/i }).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Nothing listed yet/i)).toBeInTheDocument();
  });

  it('shows saved listings on the waste listing page', async () => {
    localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify([
      {
        id: 'listing-glass',
        category: 'Glass',
        estimatedWeightKg: 6,
        suggestedPriceBdt: 90,
        photos: [],
        status: LISTING_STATUS.LISTED,
      },
    ]));

    renderHousehold('/household/listings');

    expect(await screen.findByRole('heading', { name: 'Glass' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request pickup/i })).toBeInTheDocument();
  });

  it('opens the add-waste form from the listing page', async () => {
    renderHousehold('/household/listings');
    await screen.findByText(/No waste listed/i);
    fireEvent.click(screen.getAllByRole('button', { name: /Add waste/i })[0]);
    expect(screen.getByRole('heading', { name: /Add waste/i })).toBeInTheDocument();
  });

  it('renders the wallet page from the household shell', async () => {
    renderHousehold('/household/wallet');
    expect(screen.getByRole('heading', { name: /My Wallet/i })).toBeInTheDocument();
    expect(await screen.findByText('TXN-7721')).toBeInTheDocument();
  });
});
