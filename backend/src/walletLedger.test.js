const {
  PAYOUT_METHODS,
  TXN_STATUS,
  TXN_TYPE,
  applyReview,
  applyWithdrawal,
  canReviewTransaction,
  demoTransactions,
  listReviews,
  maskPayoutReference,
  nextWithdrawalId,
  summarizeWallet,
  validateReview,
  validateWithdrawal,
} = require('./walletLedger');

describe('walletLedger (FR-04 domain)', () => {
  it('demo seed matches the household mockup totals', () => {
    const summary = summarizeWallet(demoTransactions());
    expect(summary.pendingBdt).toBe(620);
    expect(summary.availableBdt).toBe(2850);
    expect(summary.earnedBdt).toBe(8750);
  });

  it('does not let callers mutate the shared demo seed', () => {
    const first = demoTransactions();
    first[0].amountBdt = 1;
    expect(demoTransactions()[0].amountBdt).toBe(592);
  });

  it('splits pending vs available after a completed withdrawal', () => {
    const summary = summarizeWallet([
      { type: TXN_TYPE.EARNING, status: TXN_STATUS.PENDING, amountBdt: 100 },
      { type: TXN_TYPE.EARNING, status: TXN_STATUS.AVAILABLE, amountBdt: 400 },
      { type: TXN_TYPE.WITHDRAWAL, status: TXN_STATUS.COMPLETED, amountBdt: 150 },
    ]);
    expect(summary.pendingBdt).toBe(100);
    expect(summary.availableBdt).toBe(250);
    expect(summary.earnedBdt).toBe(500);
  });

  it('rejects withdrawals above the available balance', () => {
    const errors = validateWithdrawal({
      amountBdt: 300,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    }, 200);
    expect(errors.amountBdt).toMatch(/up to/);
  });

  it('requires an 11-digit mobile number for bKash and Nagad', () => {
    const errors = validateWithdrawal({
      amountBdt: 50,
      method: PAYOUT_METHODS.NAGAD,
      account: '12345',
    }, 200);
    expect(errors.account).toMatch(/11-digit/);
  });

  it('appends a masked completed withdrawal', () => {
    const next = applyWithdrawal(demoTransactions(), {
      amountBdt: 500,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    });
    expect(next[0].id).toBe('WD-7701');
    expect(next[0].reference).toBe('bKash ***678');
    expect(summarizeWallet(next).availableBdt).toBe(2350);
  });

  it('throws 400 when applyWithdrawal is invalid', () => {
    expect(() => applyWithdrawal(demoTransactions(), {
      amountBdt: 99999,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    })).toThrow(/up to/);
  });

  it('masks payout accounts and increments WD ids', () => {
    expect(maskPayoutReference(PAYOUT_METHODS.BANK, '123456789')).toBe('Bank ***789');
    expect(nextWithdrawalId([{ id: 'WD-12' }])).toBe('WD-13');
  });

  it('lets confirmed pickups be reviewed once', () => {
    const earning = {
      id: 'TXN-1',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
    };
    expect(canReviewTransaction(earning)).toBe(true);
    const next = applyReview([earning], 'TXN-1', { rating: 5, comment: 'Good' });
    expect(next[0].review.rating).toBe(5);
    expect(canReviewTransaction(next[0])).toBe(false);
  });

  it('blocks reviews on missing, pending, and already-reviewed rows', () => {
    expect(() => applyReview([], 'TXN-missing', { rating: 5 })).toThrow(/not found/);
    expect(canReviewTransaction({
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.PENDING,
    })).toBe(false);
    expect(validateReview({ rating: 0 }).rating).toMatch(/1 to 5/);
  });

  it('lists reviews and can filter by transaction id', () => {
    const reviews = listReviews(demoTransactions());
    expect(reviews.length).toBe(2);
    expect(listReviews(demoTransactions(), 'TXN-7566')[0].rating).toBe(5);
  });
});
