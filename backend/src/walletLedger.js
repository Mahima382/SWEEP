/**
 * FR-04 household wallet domain rules. Controllers and the model call this
 * module; it never imports Express or MySQL.
 */

const { demoTransactions } = require('./walletDemo');

const TXN_TYPE = {
  EARNING: 'earning',
  WITHDRAWAL: 'withdrawal',
};

const TXN_STATUS = {
  PENDING: 'pending',
  AVAILABLE: 'available',
  COMPLETED: 'completed',
};

const TXN_STATUS_LABELS = {
  [TXN_STATUS.PENDING]: 'Pending',
  [TXN_STATUS.AVAILABLE]: 'Available',
  [TXN_STATUS.COMPLETED]: 'Completed',
};

const TXN_TYPE_LABELS = {
  [TXN_TYPE.EARNING]: 'Pickup Earnings',
  [TXN_TYPE.WITHDRAWAL]: 'Withdrawal',
};

const PAYOUT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  BANK: 'bank',
};

const PAYOUT_METHOD_LABELS = {
  [PAYOUT_METHODS.BKASH]: 'bKash',
  [PAYOUT_METHODS.NAGAD]: 'Nagad',
  [PAYOUT_METHODS.BANK]: 'Bank',
};

/**
 * Format a numeric amount as Bangladeshi Taka.
 * @param {number|string} amount Amount in BDT.
 * @returns {string} Display string such as `৳120`.
 */
function formatBdt(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '৳0';
  }
  return `৳${Math.round(value).toLocaleString('en-BD')}`;
}

/**
 * Totals from a household ledger.
 * @param {object[]} transactions Wallet rows.
 * @returns {{pendingBdt: number, availableBdt: number, earnedBdt: number}}
 */
function summarizeWallet(transactions) {
  const rows = Array.isArray(transactions) ? transactions : [];
  let pendingBdt = 0;
  let earnedAvailable = 0;
  let withdrawnBdt = 0;

  rows.forEach((row) => {
    const amount = Number(row.amountBdt) || 0;
    if (row.type === TXN_TYPE.EARNING && row.status === TXN_STATUS.PENDING) {
      pendingBdt += amount;
    }
    if (row.type === TXN_TYPE.EARNING && row.status === TXN_STATUS.AVAILABLE) {
      earnedAvailable += amount;
    }
    if (row.type === TXN_TYPE.WITHDRAWAL && row.status === TXN_STATUS.COMPLETED) {
      withdrawnBdt += amount;
    }
  });

  return {
    pendingBdt,
    availableBdt: Math.max(0, earnedAvailable - withdrawnBdt),
    earnedBdt: pendingBdt + earnedAvailable,
  };
}

/**
 * Next WD-#### id after the highest withdrawal on the ledger.
 * @param {object[]} transactions Wallet rows.
 * @returns {string} New withdrawal id.
 */
function nextWithdrawalId(transactions) {
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
 * @returns {string} Ledger reference.
 */
function maskPayoutReference(method, account) {
  const label = PAYOUT_METHOD_LABELS[method] || 'Payout';
  const digits = String(account || '').replace(/\D/g, '');
  const tail = digits.slice(-3) || '000';
  return `${label} ***${tail}`;
}

/**
 * Validate a household withdrawal payload.
 * @param {object} values Form values.
 * @param {number} availableBdt Spendable balance.
 * @returns {object} Field errors, empty when valid.
 */
function validateWithdrawal(values, availableBdt) {
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
function applyWithdrawal(transactions, values) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const summary = summarizeWallet(rows);
  const errors = validateWithdrawal(values, summary.availableBdt);
  const messages = Object.values(errors);
  if (messages.length > 0) {
    const err = new Error(messages[0]);
    err.status = 400;
    err.errors = errors;
    throw err;
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
function canReviewTransaction(row) {
  if (!row || row.type !== TXN_TYPE.EARNING) {
    return false;
  }
  if (row.status !== TXN_STATUS.AVAILABLE) {
    return false;
  }
  return !row.review;
}

/**
 * Validate a 1–5 star review.
 * @param {object} values Review fields.
 * @returns {object} Field errors, empty when valid.
 */
function validateReview(values) {
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
function applyReview(transactions, transactionId, values) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const current = rows.find((row) => row.id === transactionId);
  if (!current) {
    const err = new Error('Transaction not found.');
    err.status = 404;
    throw err;
  }
  if (!canReviewTransaction(current)) {
    const err = new Error('This pickup cannot be reviewed.');
    err.status = 409;
    throw err;
  }
  const errors = validateReview(values);
  const messages = Object.values(errors);
  if (messages.length > 0) {
    const err = new Error(messages[0]);
    err.status = 400;
    err.errors = errors;
    throw err;
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

/**
 * Reviews attached to earnings on a ledger.
 * @param {object[]} transactions Wallet rows.
 * @param {string} [transactionId] Optional filter.
 * @returns {object[]} Review records.
 */
function listReviews(transactions, transactionId) {
  return (Array.isArray(transactions) ? transactions : [])
    .filter((row) => row.review && (!transactionId || row.id === transactionId))
    .map((row) => ({
      transactionId: row.id,
      rating: row.review.rating,
      comment: row.review.comment || '',
      createdAt: row.review.createdAt,
    }));
}

module.exports = {
  TXN_TYPE,
  TXN_STATUS,
  TXN_STATUS_LABELS,
  TXN_TYPE_LABELS,
  PAYOUT_METHODS,
  PAYOUT_METHOD_LABELS,
  demoTransactions,
  formatBdt,
  summarizeWallet,
  nextWithdrawalId,
  maskPayoutReference,
  validateWithdrawal,
  applyWithdrawal,
  canReviewTransaction,
  validateReview,
  applyReview,
  listReviews,
};
