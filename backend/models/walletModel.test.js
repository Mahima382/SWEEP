const {
  getReviews,
  getWallet,
  resetStore,
  saveReview,
  withdraw,
} = require('./walletModel');

describe('walletModel (FR-04 in-memory ledger)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('seeds the demo household wallet on first read', () => {
    const wallet = getWallet();
    expect(wallet.availableBdt).toBe(2850);
    expect(wallet.pendingBdt).toBe(620);
    expect(wallet.transactions[0].id).toBe('TXN-7721');
  });

  it('keeps separate ledgers per household id', () => {
    withdraw('user-a', {
      amountBdt: 500,
      method: 'bkash',
      account: '01712345678',
    });
    expect(getWallet('user-a').availableBdt).toBe(2350);
    expect(getWallet('user-b').availableBdt).toBe(2850);
  });

  it('persists a withdrawal on the same household', () => {
    withdraw('household-demo', {
      amountBdt: 200,
      method: 'nagad',
      account: '01812345678',
    });
    const again = getWallet('household-demo');
    expect(again.transactions[0].id).toBe('WD-7701');
    expect(again.transactions[0].reference).toBe('Nagad ***678');
    expect(again.availableBdt).toBe(2650);
  });

  it('saves a review and lists it', () => {
    saveReview('household-demo', 'TXN-7721', { rating: 4, comment: 'OK' });
    const reviews = getReviews('household-demo', 'TXN-7721');
    expect(reviews).toHaveLength(1);
    expect(reviews[0].rating).toBe(4);
  });

  it('resetStore restores the demo seed', () => {
    withdraw('household-demo', {
      amountBdt: 100,
      method: 'bkash',
      account: '01712345678',
    });
    resetStore();
    expect(getWallet().availableBdt).toBe(2850);
  });
});
