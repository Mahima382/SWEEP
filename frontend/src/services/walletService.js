/**
 * Household wallet service (FR-04). Components call this module instead of
 * fetch. When GET /api/wallet is still 501, a local demo ledger is used.
 */

import { get } from './api';
import {
  WALLET_STORAGE_KEY,
  demoTransactions,
} from '../data/wallet';

/**
 * Whether the wallet API is missing, stubbed, or unreachable.
 * @param {Error} error Error thrown by `request`.
 * @returns {boolean} True when the client should use the local ledger.
 */
function isApiUnavailable(error) {
  if (!error) {
    return true;
  }
  if (typeof error.status === 'undefined') {
    return true;
  }
  return error.status === 404 || error.status === 501 || error.status >= 500;
}

/**
 * Read the locally saved wallet payload.
 * @returns {(object|null)} Stored wallet, or null.
 */
function readLocalWallet() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.transactions)) {
      return parsed;
    }
    return null;
  } catch (parseError) {
    return null;
  }
}

/**
 * Persist the household wallet locally.
 * @param {object} wallet Wallet payload with `transactions`.
 * @returns {void}
 */
function writeLocalWallet(wallet) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}

/**
 * Local fallback: stored ledger, or a first-visit demo household wallet.
 * @returns {object} `{ transactions }`.
 */
function localWallet() {
  const stored = readLocalWallet();
  if (stored) {
    return stored;
  }
  const seeded = { transactions: demoTransactions() };
  writeLocalWallet(seeded);
  return seeded;
}

/**
 * Fetch the household wallet (FR-04 balances and history).
 * @returns {Promise<object>} Wallet payload with a `transactions` array.
 */
export async function getWallet() {
  try {
    const body = await get('/wallet');
    if (body && Array.isArray(body.transactions)) {
      return body;
    }
    if (Array.isArray(body)) {
      return { transactions: body };
    }
    return { transactions: [] };
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }
    return localWallet();
  }
}

export default { getWallet };
