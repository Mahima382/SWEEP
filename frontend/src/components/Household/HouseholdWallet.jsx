import React, { useState } from 'react';
import { Hourglass } from 'lucide-react';
import useWallet from '../../hooks/useWallet';
import { formatBdt } from '../../data/wallet';
import { downloadWalletCsv, downloadWalletPdf } from '../../data/walletExport';
import EarningsCategoryChart from './EarningsCategoryChart';
import WalletTransactionTable from './WalletTransactionTable';
import WithdrawFundsModal from './WithdrawFundsModal';
import TransactionReviewModal from './TransactionReviewModal';

/**
 * Household wallet: balances, withdrawals, export, and reviews (FR-04).
 * @returns {JSX.Element} Wallet page.
 */
function HouseholdWallet() {
  const {
    transactions,
    pendingBdt,
    availableBdt,
    earnedBdt,
    chartRows,
    completedPickups,
    loading,
    error,
    withdrawFunds,
    saveReview,
  } = useWallet();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [notice, setNotice] = useState('');

  const pickupLabel = completedPickups === 1
    ? 'Across 1 completed pickup'
    : `Across ${completedPickups} completed pickups`;

  const handleWithdraw = async (values) => {
    await withdrawFunds(values);
    setWithdrawOpen(false);
    setNotice(`Withdrawal of ${formatBdt(values.amountBdt)} is on the way.`);
  };

  const handleReview = async (transactionId, values) => {
    await saveReview(transactionId, values);
    setReviewTarget(null);
    setNotice('Thanks — your pickup review was saved.');
  };

  const summary = {
    pendingBdt,
    availableBdt,
    earnedBdt,
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.85rem] leading-tight text-ink sm:text-4xl">
            My Wallet
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink/65">
            Track your recycling earnings and withdraw funds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          disabled={availableBdt <= 0}
          className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-forest/20 transition hover:bg-leaf disabled:opacity-50"
        >
          Withdraw Funds
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl bg-forest px-5 py-5 text-white shadow-sm sm:px-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/80">
            Available Balance
          </p>
          <p className="mt-3 font-display text-4xl tracking-tight">
            {formatBdt(availableBdt)}
          </p>
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            disabled={availableBdt <= 0}
            className="mt-6 rounded-xl border-2 border-white/85 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Withdraw Funds
          </button>
        </article>

        <article className="rounded-2xl border border-mist bg-white px-5 py-5 shadow-sm sm:px-6">
          <p className="text-sm text-ink/55">Pending Balance</p>
          <p className="mt-3 font-display text-4xl tracking-tight text-ink">
            {formatBdt(pendingBdt)}
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-amber-600">
            <Hourglass className="h-4 w-4 shrink-0" aria-hidden="true" />
            Awaiting collector confirmation
          </p>
        </article>

        <article className="rounded-2xl border border-mist bg-white px-5 py-5 shadow-sm sm:px-6">
          <p className="text-sm text-ink/55">Total Earned (All Time)</p>
          <p className="mt-3 font-display text-4xl tracking-tight text-ink">
            {formatBdt(earnedBdt)}
          </p>
          <p className="mt-6 text-sm font-medium text-leaf">{pickupLabel}</p>
        </article>
      </div>

      {notice ? (
        <p className="mt-6 rounded-2xl bg-lime/50 px-4 py-3 text-sm text-forest" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-ink/60">Loading wallet…</p>
      ) : (
        <div className="mt-8 space-y-6">
          <EarningsCategoryChart rows={chartRows} />
          <WalletTransactionTable
            transactions={transactions}
            onReview={setReviewTarget}
            onExportCsv={() => downloadWalletCsv(transactions, summary)}
            onExportPdf={() => downloadWalletPdf(transactions, summary)}
          />
        </div>
      )}

      {withdrawOpen ? (
        <WithdrawFundsModal
          availableBdt={availableBdt}
          onClose={() => setWithdrawOpen(false)}
          onSubmit={handleWithdraw}
        />
      ) : null}

      {reviewTarget ? (
        <TransactionReviewModal
          transaction={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReview}
        />
      ) : null}
    </section>
  );
}

export default HouseholdWallet;
