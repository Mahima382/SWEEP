import React from 'react';
import PropTypes from 'prop-types';
import {
  TXN_STATUS,
  TXN_STATUS_LABELS,
  TXN_TYPE,
  TXN_TYPE_LABELS,
  formatBdt,
  formatTxnDate,
} from '../../data/wallet';

/**
 * Pill styles for a wallet transaction status.
 * @param {string} status Transaction status.
 * @returns {string} Tailwind classes.
 */
function statusPillClass(status) {
  if (status === TXN_STATUS.COMPLETED) {
    return 'bg-lime/70 text-forest';
  }
  if (status === TXN_STATUS.PENDING) {
    return 'bg-amber-50 text-amber-700';
  }
  return 'bg-foam text-ink/65';
}

/**
 * Dot colour inside a status pill.
 * @param {string} status Transaction status.
 * @returns {string} Tailwind classes.
 */
function statusDotClass(status) {
  if (status === TXN_STATUS.COMPLETED) {
    return 'bg-leaf';
  }
  if (status === TXN_STATUS.PENDING) {
    return 'bg-amber-500';
  }
  return 'bg-ink/40';
}

/**
 * Household wallet ledger as a table (FR-04).
 * @param {object} props Component props.
 * @param {object[]} props.transactions Ledger rows.
 * @returns {JSX.Element} History card.
 */
function WalletTransactionTable({ transactions }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-mist bg-white shadow-sm">
      <div className="px-5 py-5 sm:px-6">
        <h2 className="font-display text-xl text-ink">Transaction History</h2>
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 pb-6 text-sm text-ink/65 sm:px-6">
          No wallet activity yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-t border-mist text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/45">
                <th className="px-5 py-3 font-semibold sm:px-6">ID</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Reference</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => {
                const isOut = row.type === TXN_TYPE.WITHDRAWAL;
                const amount = `${isOut ? '-' : '+'}${formatBdt(row.amountBdt)}`;
                const typeLabel = TXN_TYPE_LABELS[row.type] || row.type;
                const statusLabel = TXN_STATUS_LABELS[row.status] || row.status;
                return (
                  <tr key={row.id} className="border-t border-mist/80">
                    <td className="px-5 py-4 font-semibold text-forest sm:px-6">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-ink/70">
                      {formatTxnDate(row.createdAt)}
                    </td>
                    <td className="px-3 py-4 font-medium text-ink">{typeLabel}</td>
                    <td className="px-3 py-4 text-ink/55">{row.reference || '—'}</td>
                    <td
                      className={`whitespace-nowrap px-3 py-4 font-semibold ${
                        isOut ? 'text-red-600' : 'text-leaf'
                      }`}
                    >
                      {amount}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(row.status)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDotClass(row.status)}`}
                          aria-hidden="true"
                        />
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

WalletTransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    amountBdt: PropTypes.number.isRequired,
    reference: PropTypes.string,
    createdAt: PropTypes.string,
  })).isRequired,
};

export default WalletTransactionTable;
