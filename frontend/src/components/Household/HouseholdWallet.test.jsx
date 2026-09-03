import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import HouseholdWallet from './HouseholdWallet';
import { WALLET_STORAGE_KEY } from '../../data/wallet';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  });
}

describe('HouseholdWallet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', mockFetch(501, {
      message: 'Wallet — not implemented yet (FR-04)',
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the mockup balances, chart, and transaction table', async () => {
    render(
      <MemoryRouter>
        <HouseholdWallet />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /My Wallet/i })).toBeInTheDocument();
    expect(screen.getByText(/Track your recycling earnings/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Withdraw Funds/i }).length)
      .toBeGreaterThan(0);

    expect(await screen.findByText('TXN-7721')).toBeInTheDocument();
    expect(screen.getByText(/PH-1082 \(Plastic\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting collector confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(/Across 14 completed pickups/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Earnings by Waste Category/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Transaction History/i }))
      .toBeInTheDocument();
    expect(screen.getByText('WD-7700')).toBeInTheDocument();
    expect(screen.getByText(/bKash \*\*\*123/i)).toBeInTheDocument();
  });

  it('renders stored ledger rows in the history table', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
      transactions: [
        {
          id: 'TXN-1001',
          type: 'earning',
          status: 'pending',
          amountBdt: 50,
          category: 'Glass',
          reference: 'PH-2001 (Glass)',
          createdAt: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'TXN-1002',
          type: 'earning',
          status: 'available',
          amountBdt: 80,
          category: 'Paper',
          reference: 'PH-2002 (Paper)',
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ],
    }));

    render(
      <MemoryRouter>
        <HouseholdWallet />
      </MemoryRouter>,
    );

    expect(await screen.findByText('TXN-1001')).toBeInTheDocument();
    expect(screen.getByText('TXN-1002')).toBeInTheDocument();
    expect(screen.getByText(/PH-2001 \(Glass\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PH-2002 \(Paper\)/i)).toBeInTheDocument();
  });
});
