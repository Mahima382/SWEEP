/**
 * Wallet model — household ledger access (D5 Wallets / FR-04).
 * In-memory store until MySQL tables in schema.sql are wired up.
 * Model layer only: no Express imports.
 */

const {
  applyReview,
  applyWithdrawal,
  demoTransactions,
  listReviews,
  summarizeWallet,
} = require('../src/walletLedger');

const DEFAULT_HOUSEHOLD_ID = 'household-demo';

/** @type {Map<string, object[]>} */
const ledgers = new Map();

/**
 * Deep-clone a value with JSON.
 * @param {*} value Source.
 * @returns {*} Clone.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Ledger for a household, seeded on first read.
 * @param {string} userId Wallet owner id.
 * @returns {object[]} Mutable transaction list.
 */
function ledgerFor(userId) {
  const key = userId || DEFAULT_HOUSEHOLD_ID;
  if (!ledgers.has(key)) {
    ledgers.set(key, demoTransactions());
  }
  return ledgers.get(key);
}

/**
 * Snapshot of a household wallet (balances + history).
 * @param {string} [userId] Wallet owner id.
 * @returns {object} Wallet payload for the API.
 */
function getWallet(userId) {
  const transactions = clone(ledgerFor(userId));
  return { transactions, ...summarizeWallet(transactions) };
}

/**
 * Withdraw available funds to bKash, Nagad, or a bank account.
 * @param {string} userId Wallet owner id.
 * @param {object} values Withdrawal form.
 * @returns {object} Updated wallet payload.
 */
function withdraw(userId, values) {
  const next = applyWithdrawal(ledgerFor(userId), values);
  ledgers.set(userId || DEFAULT_HOUSEHOLD_ID, next);
  return getWallet(userId);
}

/**
 * Save a 1–5 star review on a confirmed pickup earning.
 * @param {string} userId Wallet owner id.
 * @param {string} transactionId Earning id.
 * @param {object} values Review fields.
 * @returns {object} Updated wallet payload.
 */
function saveReview(userId, transactionId, values) {
  const next = applyReview(ledgerFor(userId), transactionId, values);
  ledgers.set(userId || DEFAULT_HOUSEHOLD_ID, next);
  return getWallet(userId);
}

/**
 * Reviews on the household ledger.
 * @param {string} [userId] Wallet owner id.
 * @param {string} [transactionId] Optional filter.
 * @returns {object[]} Review records.
 */
function getReviews(userId, transactionId) {
  return listReviews(ledgerFor(userId), transactionId);
}

/**
 * Clear in-memory ledgers (tests only).
 * @returns {void}
 */
function resetStore() {
  ledgers.clear();
}

module.exports = {
  DEFAULT_HOUSEHOLD_ID,
  getWallet,
  withdraw,
  saveReview,
  getReviews,
  resetStore,
};
