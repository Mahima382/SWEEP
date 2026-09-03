import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import {
  TXN_STATUS,
  TXN_STATUS_LABELS,
  TXN_TYPE,
  TXN_TYPE_LABELS,
  formatBdt,
  formatTxnDate,
} from '../../data/wallet';
import { canReviewTransaction } from '../../data/walletPayout';

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
 * Compact star readout for a saved review.
 * @param {object} props Component props.
 * @param {number} props.rating Stars from 1 to 5.
 * @returns {JSX.Element} Stars.
 */
function ReviewStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-leaf" aria-label={`${rating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? 'fill-leaf text-leaf' : 'text-mist'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

ReviewStars.propTypes = {
  rating: PropTypes.number.isRequired,
};

/**
 * Household wallet ledger as a table (FR-04).
 * @param {object} props Component props.
 * @param {object[]} props.transactions Ledger rows.
 * @param {Function} [props.onReview] Opens the review modal for an earning.
 * @param {Function} [props.onExportCsv] Download CSV.
 * @param {Function} [props.onExportPdf] Download PDF.
 * @returns {JSX.Element} History card.
 */
function WalletTransactionTable({
  transactions,
  onReview,
  onExportCsv,
  onExportPdf,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-mist bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <h2 className="font-display text-xl text-ink">Transaction History</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            className="rounded-xl border-2 border-forest/30 bg-white px-3.5 py-1.5 text-sm font-semibold text-forest hover:bg-sand"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="rounded-xl border-2 border-forest/30 bg-white px-3.5 py-1.5 text-sm font-semibold text-forest hover:bg-sand"
          >
            Export PDF
          </button>
        </div>
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
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Review</th>
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
                    <td className="px-3 py-4">
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
                    <td className="px-5 py-4 sm:px-6">
                      {row.review ? (
                        <ReviewStars rating={row.review.rating} />
                      ) : null}
                      {canReviewTransaction(row) ? (
                        <button
                          type="button"
                          onClick={() => onReview(row)}
                          className="text-sm font-semibold text-forest hover:underline"
                        >
                          Review
                        </button>
                      ) : null}
                      {row.type === TXN_TYPE.EARNING && row.status === TXN_STATUS.PENDING ? (
                        <span className="text-xs text-ink/45">After confirmation</span>
                      ) : null}
                      {isOut && !row.review ? (
                        <span className="text-ink/35">—</span>
                      ) : null}
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
    review: PropTypes.shape({
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
    }),
  })).isRequired,
  onReview: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
  onExportPdf: PropTypes.func.isRequired,
};

export default WalletTransactionTable;
