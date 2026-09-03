import React from 'react';
import PropTypes from 'prop-types';
import { chartAxisMax, chartAxisTicks, formatBdt } from '../../data/wallet';

/**
 * CSS bar chart of household earnings by waste type (FR-04).
 * @param {object} props Component props.
 * @param {object[]} props.rows Category totals in display order.
 * @returns {JSX.Element} Chart card.
 */
function EarningsCategoryChart({ rows }) {
  const peak = Math.max(0, ...rows.map((row) => Number(row.amountBdt) || 0));
  const axisMax = chartAxisMax(peak);
  const ticks = chartAxisTicks(peak);

  return (
    <section className="rounded-2xl border border-mist bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl text-ink">Earnings by Waste Category</h2>
      <p className="mt-1 text-sm text-ink/55">
        Total earnings broken down by waste type.
      </p>

      <div className="relative mt-6 h-64">
        {ticks.map((tick, index) => {
          const top = ticks.length === 1
            ? 0
            : (index / (ticks.length - 1)) * 100;
          return (
            <div
              key={tick}
              className="absolute right-0 left-0 flex items-center"
              style={{ top: `${top}%`, transform: 'translateY(-50%)' }}
            >
              <span className="w-14 shrink-0 text-right text-xs text-ink/45">
                {formatBdt(tick)}
              </span>
              <span
                className="ml-3 h-px flex-1 border-t border-dashed border-mist"
                aria-hidden="true"
              />
            </div>
          );
        })}

        <div className="absolute inset-y-0 right-0 left-[4.25rem] flex items-end justify-around gap-1">
          {rows.map((row) => {
            const amount = Number(row.amountBdt) || 0;
            const height = axisMax > 0 ? (amount / axisMax) * 100 : 0;
            return (
              <div
                key={row.category}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-[55%] max-w-[3.25rem] rounded-t-md bg-forest"
                  style={{ height: `${height}%` }}
                  title={`${row.category}: ${formatBdt(amount)}`}
                  role="img"
                  aria-label={`${row.category} ${formatBdt(amount)}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-around gap-1 pl-[4.25rem] text-center text-xs font-medium text-ink/70">
        {rows.map((row) => (
          <span key={row.category} className="min-w-0 flex-1 truncate">
            {row.category}
          </span>
        ))}
      </div>
    </section>
  );
}

EarningsCategoryChart.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    amountBdt: PropTypes.number.isRequired,
  })).isRequired,
};

export default EarningsCategoryChart;
