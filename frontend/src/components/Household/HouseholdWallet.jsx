import React from 'react';
import { Hourglass } from 'lucide-react';
import useWallet from '../../hooks/useWallet';
import { formatBdt } from '../../data/wallet';
import EarningsCategoryChart from './EarningsCategoryChart';
import WalletTransactionTable from './WalletTransactionTable';

/**
 * Household wallet: balances, category chart, and ledger (FR-04 segment 1).
 * Withdrawal is visual only until the next segment.
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
  } = useWallet();

  const pickupLabel = completedPickups === 1
    ? 'Across 1 completed pickup'
    : `Across ${completedPickups} completed pickups`;

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
          className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-forest/20 transition hover:bg-leaf"
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
            className="mt-6 rounded-xl border-2 border-white/85 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
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
          <WalletTransactionTable transactions={transactions} />
        </div>
      )}
    </section>
  );
}

export default HouseholdWallet;
