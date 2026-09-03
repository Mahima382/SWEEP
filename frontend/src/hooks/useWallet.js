import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getWallet,
  requestWithdrawal,
  saveTransactionReview,
} from '../services/walletService';
import {
  chartCategoryTotals,
  completedPickupCount,
  earningsByCategory,
  summarizeWallet,
} from '../data/wallet';

/**
 * Loads the household wallet ledger and derived FR-04 totals.
 * @returns {{
 *   transactions: object[],
 *   pendingBdt: number,
 *   availableBdt: number,
 *   earnedBdt: number,
 *   breakdown: object[],
 *   chartRows: object[],
 *   completedPickups: number,
 *   loading: boolean,
 *   error: (string|null),
 *   refresh: Function,
 *   withdrawFunds: Function,
 *   saveReview: Function,
 * }} Wallet state.
 */
export default function useWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await getWallet();
      setTransactions(wallet.transactions || []);
    } catch (err) {
      setError(err.message || 'Could not load wallet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const withdrawFunds = useCallback(async (values) => {
    const wallet = await requestWithdrawal(values);
    setTransactions(wallet.transactions || []);
    return wallet;
  }, []);

  const saveReview = useCallback(async (transactionId, values) => {
    const wallet = await saveTransactionReview(transactionId, values);
    setTransactions(wallet.transactions || []);
    return wallet;
  }, []);

  const summary = useMemo(() => summarizeWallet(transactions), [transactions]);
  const breakdown = useMemo(
    () => earningsByCategory(transactions),
    [transactions],
  );
  const chartRows = useMemo(
    () => chartCategoryTotals(transactions),
    [transactions],
  );
  const completedPickups = useMemo(
    () => completedPickupCount(transactions),
    [transactions],
  );

  return {
    transactions,
    pendingBdt: summary.pendingBdt,
    availableBdt: summary.availableBdt,
    earnedBdt: summary.earnedBdt,
    breakdown,
    chartRows,
    completedPickups,
    loading,
    error,
    refresh,
    withdrawFunds,
    saveReview,
  };
}
