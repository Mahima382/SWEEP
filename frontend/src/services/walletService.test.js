import { WALLET_STORAGE_KEY, demoTransactions } from '../data/wallet';
import { getWallet, requestWithdrawal, saveTransactionReview } from './walletService';
import { PAYOUT_METHODS } from '../data/walletPayout';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('walletService (FR-04 local fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a seeded demo wallet when the API is not implemented', async () => {
    vi.stubGlobal('fetch', mockFetch(501, {
      message: 'Wallet — not implemented yet (FR-04)',
    }));

    const wallet = await getWallet();
    expect(wallet.transactions.length).toBe(demoTransactions().length);
    expect(JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY)).transactions)
      .toHaveLength(demoTransactions().length);
  });

  it('returns stored transactions on later visits', async () => {
    const stored = {
      transactions: [
        {
          id: 'txn-keep',
          type: 'earning',
          status: 'available',
          amountBdt: 40,
        },
      ],
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(stored));
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));

    const wallet = await getWallet();
    expect(wallet.transactions).toEqual(stored.transactions);
  });

  it('records a local withdrawal when the API is not implemented', async () => {
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));
    await getWallet();

    const wallet = await requestWithdrawal({
      amountBdt: 500,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    });
    expect(wallet.transactions[0].id).toBe('WD-7701');
    expect(wallet.transactions[0].reference).toBe('bKash ***678');
  });

  it('saves a local pickup review when the API is not implemented', async () => {
    vi.stubGlobal('fetch', mockFetch(501, { message: 'not implemented' }));
    await getWallet();

    const wallet = await saveTransactionReview('TXN-7721', {
      rating: 5,
      comment: 'Quick pickup',
    });
    const reviewed = wallet.transactions.find((row) => row.id === 'TXN-7721');
    expect(reviewed.review.rating).toBe(5);
    expect(reviewed.review.comment).toBe('Quick pickup');
  });

  it('uses the server wallet when GET /api/wallet succeeds', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {
      transactions: [
        {
          id: 'TXN-api',
          type: 'earning',
          status: 'available',
          amountBdt: 10,
        },
      ],
      availableBdt: 10,
      pendingBdt: 0,
      earnedBdt: 10,
    }));

    const wallet = await getWallet();
    expect(wallet.transactions[0].id).toBe('TXN-api');
  });

  it('returns the server wallet after a successful withdrawal', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {
      transactions: [{ id: 'WD-9000', type: 'withdrawal', amountBdt: 100 }],
      availableBdt: 2750,
    }));

    const wallet = await requestWithdrawal({
      amountBdt: 100,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    });
    expect(wallet.transactions[0].id).toBe('WD-9000');
  });

  it('surfaces a 400 withdrawal error from the API', async () => {
    vi.stubGlobal('fetch', mockFetch(400, {
      message: 'You can withdraw up to ৳2,850.',
      errors: { amountBdt: 'You can withdraw up to ৳2,850.' },
    }));

    await expect(requestWithdrawal({
      amountBdt: 99999,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    })).rejects.toThrow(/up to/);
  });
});
