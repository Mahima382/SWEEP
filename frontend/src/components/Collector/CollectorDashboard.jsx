import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Calculates total waste weight in kilograms.
 * @param {Array<{weight: number|string}>} wasteList Waste items list.
 * @returns {number} Total weight in kilograms.
 */
function calculateTotalWeight(wasteList) {
  if (!Array.isArray(wasteList)) {
    return 0;
  }
  return wasteList.reduce(
    (total, item) => total + (Number(item?.weight) || 0),
    0,
  );
}

/**
 * Determines the payment status of a held waste lot.
 * @param {object} item Lot item.
 * @returns {string|null} The payment status ('Available', 'Pending', or null).
 */
function getLotPaymentStatus(item) {
  if (item.paymentStatus) {
    return item.paymentStatus;
  }
  if (item.status === 'Handed Over' || item.handoverConfirmed === true) {
    return 'Available';
  }
  if (item.handoverConfirmed === false) {
    return 'Pending';
  }
  return null;
}

/**
 * Collector dashboard (FR-05, FR-06).
 * Displays waste currently held broken down by category and total weight,
 * collector earnings with filtering, and payment status.
 * @param {object} props Component props.
 * @param {Array} [props.heldWaste] Waste currently held by collector.
 * @param {object} [props.earnings] Collector earnings breakdown.
 * @param {Array} [props.earningsRecords] Individual earnings records.
 * @param {object} [props.payments] Collector payments summary.
 * @returns {JSX.Element} The collector dashboard.
 */
function CollectorDashboard({
  heldWaste = [],
  earnings = null,
  earningsRecords = [],
  payments = null,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const totalWeight = useMemo(() => calculateTotalWeight(heldWaste), [heldWaste]);

  const records = useMemo(() => {
    if (earningsRecords && earningsRecords.length > 0) {
      return earningsRecords;
    }
    if (earnings?.records && earnings.records.length > 0) {
      return earnings.records;
    }
    return [];
  }, [earningsRecords, earnings]);

  const availableCategories = useMemo(() => {
    const defaults = ['Plastic', 'Paper'];
    const fromRecords = records.map((r) => r.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromRecords]));
  }, [records]);

  const displayedPeriodEarnings = useMemo(() => {
    if (selectedPeriod === 'all') {
      return null;
    }
    if (earnings?.periodEarnings?.[selectedPeriod] !== undefined) {
      return earnings.periodEarnings[selectedPeriod];
    }
    const matchingRecords = records.filter((rec) => rec.period === selectedPeriod);
    return matchingRecords.reduce((sum, rec) => sum + (Number(rec.amount) || 0), 0);
  }, [selectedPeriod, earnings, records]);

  const categoryAmount = useMemo(() => {
    if (selectedCategory === 'all') {
      return null;
    }
    const matching = records.find((rec) => rec.category === selectedCategory);
    return matching ? matching.amount : 0;
  }, [selectedCategory, records]);

  return (
    <section>
      <h1>Collector Dashboard</h1>
      <h2>Held Waste</h2>
      {heldWaste.length === 0 ? (
        <p>No waste currently held.</p>
      ) : (
        <ul>
          {heldWaste.map((item) => {
            const lotPaymentStatus = getLotPaymentStatus(item);
            return (
              <li key={item.id || item.category}>
                <span>{item.category}</span>: <span>{item.weight} kg</span>
                {item.dateCollected && (
                  <>
                    {' '}— <span>{item.dateCollected}</span>
                  </>
                )}
                {item.status && (
                  <>
                    {' '}— <span>{item.status}</span>
                  </>
                )}
                {lotPaymentStatus && (
                  <>
                    {' '}— <span>Payment: {lotPaymentStatus}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p>Total held waste: {totalWeight} kg</p>

      {earnings && (
        <section>
          <h2>Earnings</h2>

          <div>
            <label htmlFor="period-filter">Filter by period:</label>
            <select
              id="period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">All</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div>
            <label htmlFor="category-filter">Filter by category:</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {selectedPeriod === 'all' && selectedCategory === 'all' && (
            <div>
              <p>Total revenue: {earnings.totalRevenue} BDT</p>
              <p>Platform commission: {earnings.platformCommission} BDT</p>
              <p>Net payout: {earnings.netPayout} BDT</p>
            </div>
          )}

          {selectedPeriod !== 'all' && (
            <p>
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} earnings:{' '}
              {displayedPeriodEarnings} BDT
            </p>
          )}

          {selectedCategory !== 'all' && (
            <p>
              {selectedCategory} earnings: {categoryAmount} BDT
            </p>
          )}
        </section>
      )}

      {payments && (
        <section>
          <h2>Payments</h2>
          <p>
            Pending payments: <span>{payments.pending !== undefined ? payments.pending : 0} BDT</span>
          </p>
          <p>
            Available payments: <span>{payments.available !== undefined ? payments.available : 0} BDT</span>
          </p>
        </section>
      )}
    </section>
  );
}


CollectorDashboard.propTypes = {
  heldWaste: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      category: PropTypes.string.isRequired,
      weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      dateCollected: PropTypes.string,
      status: PropTypes.string,
      handoverConfirmed: PropTypes.bool,
      paymentStatus: PropTypes.string,
    }),
  ),
  earnings: PropTypes.shape({
    totalRevenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    platformCommission: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    netPayout: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    periodEarnings: PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
    records: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        category: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        period: PropTypes.string,
      }),
    ),
  }),
  earningsRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      category: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      period: PropTypes.string,
    }),
  ),
  payments: PropTypes.shape({
    pending: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    available: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default CollectorDashboard;

test('displays transaction history with credits and debits', () => {
  const transactions = [
    {
      id: 1,
      type: 'Credit',
      amount: 500,
      date: '2026-09-03',
    },
    {
      id: 2,
      type: 'Debit',
      amount: 100,
      date: '2026-09-03',
    },
  ];

  render(
    <CollectorDashboard
      heldWaste={[]}
      transactions={transactions}
    />
  );

  expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
  expect(screen.getByText(/credit/i)).toBeInTheDocument();
  expect(screen.getByText(/500 BDT/i)).toBeInTheDocument();
  expect(screen.getByText(/debit/i)).toBeInTheDocument();
  expect(screen.getByText(/100 BDT/i)).toBeInTheDocument();
  expect(screen.getAllByText(/2026-09-03/)).toHaveLength(2);
});
