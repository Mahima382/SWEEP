/**
 * FR-04 segment 2: withdrawal validation and per-transaction reviews.
 */

import {
  TXN_STATUS,
  TXN_TYPE,
  formatBdt,
  summarizeWallet,
} from './wallet';

export const PAYOUT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  BANK: 'bank',
};

export const PAYOUT_METHOD_LABELS = {
  [PAYOUT_METHODS.BKASH]: 'bKash',
  [PAYOUT_METHODS.NAGAD]: 'Nagad',
  [PAYOUT_METHODS.BANK]: 'Bank',
};

/**
 * Next WD-#### id after the highest withdrawal already on the ledger.
 * @param {object[]} transactions Wallet ledger rows.
 * @returns {string} New withdrawal id.
 */
export function nextWithdrawalId(transactions) {
  let max = 0;
  (Array.isArray(transactions) ? transactions : []).forEach((row) => {
    const match = /^WD-(\d+)$/.exec(row.id || '');
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  });
  return `WD-${max + 1}`;
}

/**
 * Mask a payout account like "bKash ***123".
 * @param {string} method Payout method id.
 * @param {string} account Phone or bank account number.
 * @returns {string} Reference shown on the ledger.
 */
export function maskPayoutReference(method, account) {
  const label = PAYOUT_METHOD_LABELS[method] || 'Payout';
  const digits = String(account || '').replace(/\D/g, '');
  const tail = digits.slice(-3) || '000';
  return `${label} ***${tail}`;
}

/**
 * Validate a household withdrawal form (FR-04).
 * @param {object} values Form values.
 * @param {number} availableBdt Spendable balance.
 * @returns {object} Field errors, empty when valid.
 */
export function validateWithdrawal(values, availableBdt) {
  const errors = {};
  const amount = Number(values && values.amountBdt);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amountBdt = 'Enter an amount greater than ৳0.';
  } else if (!Number.isInteger(amount)) {
    errors.amountBdt = 'Use whole Taka amounts.';
  } else if (amount > (Number(availableBdt) || 0)) {
    errors.amountBdt = `You can withdraw up to ${formatBdt(availableBdt)}.`;
  }

  const method = values && values.method;
  if (!Object.values(PAYOUT_METHODS).includes(method)) {
    errors.method = 'Choose bKash, Nagad, or bank.';
  }

  const digits = String((values && values.account) || '').replace(/\s/g, '');
  if (method === PAYOUT_METHODS.BANK) {
    if (!/^\d{8,20}$/.test(digits)) {
      errors.account = 'Enter a bank account number (8–20 digits).';
    }
  } else if (!errors.method && !/^01\d{9}$/.test(digits)) {
    errors.account = 'Enter an 11-digit mobile number starting with 01.';
  }

  return errors;
}

/**
 * Append a completed withdrawal and return a new ledger.
 * @param {object[]} transactions Current ledger.
 * @param {{amountBdt: number|string, method: string, account: string}} values Form.
 * @returns {object[]} Ledger with the withdrawal first.
 */
export function applyWithdrawal(transactions, values) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const summary = summarizeWallet(rows);
  const errors = validateWithdrawal(values, summary.availableBdt);
  const messages = Object.values(errors);
  if (messages.length > 0) {
    throw new Error(messages[0]);
  }
  const row = {
    id: nextWithdrawalId(rows),
    type: TXN_TYPE.WITHDRAWAL,
    status: TXN_STATUS.COMPLETED,
    amountBdt: Number(values.amountBdt),
    category: null,
    reference: maskPayoutReference(values.method, values.account),
    createdAt: new Date().toISOString(),
  };
  return [row, ...rows];
}

/**
 * Whether a ledger row can take a new household review.
 * @param {object} row Transaction.
 * @returns {boolean} True for confirmed pickup earnings without a review.
 */
export function canReviewTransaction(row) {
  if (!row || row.type !== TXN_TYPE.EARNING) {
    return false;
  }
  if (row.status !== TXN_STATUS.AVAILABLE) {
    return false;
  }
  return !row.review;
}

/**
 * Validate a 1–5 star review on a pickup earning.
 * @param {object} values Review fields.
 * @returns {object} Field errors, empty when valid.
 */
export function validateReview(values) {
  const errors = {};
  const rating = Number(values && values.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Choose a rating from 1 to 5 stars.';
  }
  const comment = String((values && values.comment) || '');
  if (comment.length > 280) {
    errors.comment = 'Keep the comment under 280 characters.';
  }
  return errors;
}

/**
 * Attach a review to one earning and return a new ledger.
 * @param {object[]} transactions Current ledger.
 * @param {string} transactionId Earning id.
 * @param {{rating: number, comment?: string}} values Review fields.
 * @returns {object[]} Updated ledger.
 */
export function applyReview(transactions, transactionId, values) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const current = rows.find((row) => row.id === transactionId);
  if (!current) {
    throw new Error('Transaction not found.');
  }
  if (!canReviewTransaction(current)) {
    throw new Error('This pickup cannot be reviewed.');
  }
  const errors = validateReview(values);
  const messages = Object.values(errors);
  if (messages.length > 0) {
    throw new Error(messages[0]);
  }
  const review = {
    rating: Number(values.rating),
    comment: String(values.comment || '').trim(),
    createdAt: new Date().toISOString(),
  };
  return rows.map((row) => (
    row.id === transactionId ? { ...row, review } : row
  ));
}
