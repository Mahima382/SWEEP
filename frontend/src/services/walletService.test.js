import { WALLET_STORAGE_KEY, demoTransactions } from '../data/wallet';
import { getWallet } from './walletService';

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
});
