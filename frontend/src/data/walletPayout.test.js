import {
  PAYOUT_METHODS,
  applyReview,
  applyWithdrawal,
  canReviewTransaction,
  maskPayoutReference,
  nextWithdrawalId,
  validateReview,
  validateWithdrawal,
} from './walletPayout';
import {
  TXN_STATUS,
  TXN_TYPE,
  demoTransactions,
  summarizeWallet,
} from './wallet';

describe('wallet payout helpers (FR-04 segment 2)', () => {
  it('rejects withdrawals above the available balance', () => {
    const errors = validateWithdrawal({
      amountBdt: 300,
      method: PAYOUT_METHODS.BKASH,
      account: '01712345678',
    }, 200);
    expect(errors.amountBdt).toMatch(/up to/);
  });

  it('requires an 11-digit bKash or Nagad number', () => {
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
    expect(next[0].type).toBe(TXN_TYPE.WITHDRAWAL);
    expect(summarizeWallet(next).availableBdt).toBe(2350);
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
    expect(validateReview({ rating: 5, comment: 'Good' })).toEqual({});

    const next = applyReview([earning], 'TXN-1', { rating: 5, comment: 'Good' });
    expect(next[0].review.rating).toBe(5);
    expect(canReviewTransaction(next[0])).toBe(false);
  });

  it('blocks reviews on withdrawals and pending earnings', () => {
    expect(canReviewTransaction({
      type: TXN_TYPE.WITHDRAWAL,
      status: TXN_STATUS.COMPLETED,
    })).toBe(false);
    expect(canReviewTransaction({
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.PENDING,
    })).toBe(false);
    expect(validateReview({ rating: 0 }).rating).toMatch(/1 to 5/);
  });
});
