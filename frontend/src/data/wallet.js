/**
 * FR-04 household wallet helpers: pending vs available balances and
 * earnings breakdown. Withdrawal, export, and reviews are in walletPayout
 * and walletExport.
 */

import { formatBdt } from './wasteListing';

export const WALLET_STORAGE_KEY = 'sweep.household.wallet.v3';

export const TXN_TYPE = {
  EARNING: 'earning',
  WITHDRAWAL: 'withdrawal',
};

export const TXN_STATUS = {
  PENDING: 'pending',
  AVAILABLE: 'available',
  COMPLETED: 'completed',
};

export const TXN_STATUS_LABELS = {
  [TXN_STATUS.PENDING]: 'Pending',
  [TXN_STATUS.AVAILABLE]: 'Available',
  [TXN_STATUS.COMPLETED]: 'Completed',
};

export const TXN_TYPE_LABELS = {
  [TXN_TYPE.EARNING]: 'Pickup Earnings',
  [TXN_TYPE.WITHDRAWAL]: 'Withdrawal',
};

export const CHART_CATEGORIES = [
  'Plastic',
  'Paper',
  'Metal',
  'Glass',
  'E-Waste',
  'Organic',
];

export const CHART_AXIS_STEP = 800;

/**
 * Sample household wallet activity used when the API is still a stub.
 * @returns {object[]} Demo transactions.
 */
export function demoTransactions() {
  return [
    {
      id: 'TXN-7721',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 592,
      category: 'Plastic',
      reference: 'PH-1082 (Plastic)',
      createdAt: '2026-08-23T10:00:00.000Z',
    },
    {
      id: 'TXN-7718',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 408,
      category: 'Plastic',
      reference: 'PH-1079 (Plastic)',
      createdAt: '2026-08-21T09:00:00.000Z',
    },
    {
      id: 'WD-7700',
      type: TXN_TYPE.WITHDRAWAL,
      status: TXN_STATUS.COMPLETED,
      amountBdt: 2000,
      category: null,
      reference: 'bKash ***123',
      createdAt: '2026-08-18T14:00:00.000Z',
    },
    {
      id: 'TXN-7694',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 400,
      category: 'Plastic',
      reference: 'PH-1071 (Plastic)',
      createdAt: '2026-08-15T11:00:00.000Z',
    },
    {
      id: 'TXN-7688',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 400,
      category: 'Plastic',
      reference: 'PH-1064 (Plastic)',
      createdAt: '2026-08-10T08:30:00.000Z',
    },
    {
      id: 'TXN-7672',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 214,
      category: 'Paper',
      reference: 'PH-1058 (Paper)',
      createdAt: '2026-08-04T16:00:00.000Z',
    },
    {
      id: 'TXN-7661',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 186,
      category: 'Paper',
      reference: 'PH-1049 (Paper)',
      createdAt: '2026-07-28T12:00:00.000Z',
    },
    {
      id: 'WD-7650',
      type: TXN_TYPE.WITHDRAWAL,
      status: TXN_STATUS.COMPLETED,
      amountBdt: 1800,
      category: null,
      reference: 'Nagad ***456',
      createdAt: '2026-07-25T13:00:00.000Z',
    },
    {
      id: 'TXN-7648',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 720,
      category: 'Metal',
      reference: 'PH-1044 (Metal)',
      createdAt: '2026-07-22T09:00:00.000Z',
    },
    {
      id: 'TXN-7640',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 400,
      category: 'Metal',
      reference: 'PH-1038 (Metal)',
      createdAt: '2026-07-18T15:00:00.000Z',
    },
    {
      id: 'TXN-7631',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 380,
      category: 'Metal',
      reference: 'PH-1028 (Metal)',
      createdAt: '2026-07-12T10:00:00.000Z',
    },
    {
      id: 'TXN-7620',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 280,
      category: 'Glass',
      reference: 'PH-1019 (Glass)',
      createdAt: '2026-07-06T11:00:00.000Z',
    },
    {
      id: 'WD-7612',
      type: TXN_TYPE.WITHDRAWAL,
      status: TXN_STATUS.COMPLETED,
      amountBdt: 1480,
      category: null,
      reference: 'Bank ***789',
      createdAt: '2026-07-02T12:00:00.000Z',
    },
    {
      id: 'TXN-7608',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 1800,
      category: 'E-Waste',
      reference: 'PH-1011 (E-Waste)',
      createdAt: '2026-06-29T09:00:00.000Z',
    },
    {
      id: 'TXN-7594',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 1500,
      category: 'E-Waste',
      reference: 'PH-1004 (E-Waste)',
      createdAt: '2026-06-20T10:00:00.000Z',
    },
    {
      id: 'TXN-7580',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 700,
      category: 'E-Waste',
      reference: 'PH-0991 (E-Waste)',
      review: {
        rating: 4,
        comment: 'Pickup was on time.',
        createdAt: '2026-06-13T14:00:00.000Z',
      },
      createdAt: '2026-06-12T14:00:00.000Z',
    },
    {
      id: 'TXN-7566',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.AVAILABLE,
      amountBdt: 150,
      category: 'Organic',
      reference: 'PH-0978 (Organic)',
      review: {
        rating: 5,
        comment: 'Friendly collector.',
        createdAt: '2026-06-05T08:00:00.000Z',
      },
      createdAt: '2026-06-04T08:00:00.000Z',
    },
    {
      id: 'TXN-7542',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.PENDING,
      amountBdt: 400,
      category: 'Paper',
      reference: 'PH-0962 (Paper)',
      createdAt: '2026-05-28T09:00:00.000Z',
    },
    {
      id: 'TXN-7530',
      type: TXN_TYPE.EARNING,
      status: TXN_STATUS.PENDING,
      amountBdt: 220,
      category: 'Glass',
      reference: 'PH-0951 (Glass)',
      createdAt: '2026-05-22T15:00:00.000Z',
    },
  ];
}

/**
 * Totals for the household wallet from a transaction list.
 * Pending earnings stay locked. Available earnings minus completed
 * withdrawals is cash the household can take out later.
 * @param {object[]} transactions Wallet ledger rows.
 * @returns {{pendingBdt: number, availableBdt: number, earnedBdt: number}}
 */
export function summarizeWallet(transactions) {
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
 * Count pickups that have already moved past pending.
 * @param {object[]} transactions Wallet ledger rows.
 * @returns {number} Completed pickup count.
 */
export function completedPickupCount(transactions) {
  return (Array.isArray(transactions) ? transactions : []).filter((row) => (
    row.type === TXN_TYPE.EARNING && row.status !== TXN_STATUS.PENDING
  )).length;
}

/**
 * Sum earnings by waste category (FR-04 breakdown).
 * @param {object[]} transactions Wallet ledger rows.
 * @returns {{category: string, amountBdt: number}[]} Sorted high to low.
 */
export function earningsByCategory(transactions) {
  const totals = {};
  (Array.isArray(transactions) ? transactions : []).forEach((row) => {
    if (row.type !== TXN_TYPE.EARNING || !row.category) {
      return;
    }
    const amount = Number(row.amountBdt) || 0;
    totals[row.category] = (totals[row.category] || 0) + amount;
  });
  return Object.keys(totals)
    .map((category) => ({ category, amountBdt: totals[category] }))
    .sort((left, right) => right.amountBdt - left.amountBdt);
}

/**
 * Category totals in chart order, including empty types at ৳0.
 * @param {object[]} transactions Wallet ledger rows.
 * @returns {{category: string, amountBdt: number}[]}
 */
export function chartCategoryTotals(transactions) {
  const grouped = earningsByCategory(transactions);
  const byName = {};
  grouped.forEach((row) => {
    byName[row.category] = row.amountBdt;
  });
  return CHART_CATEGORIES.map((category) => ({
    category,
    amountBdt: byName[category] || 0,
  }));
}

/**
 * Nice y-axis maximum for the category bar chart.
 * @param {number} peak Highest category total.
 * @returns {number} Axis max in BDT.
 */
export function chartAxisMax(peak) {
  if (!peak || peak <= 0) {
    return CHART_AXIS_STEP;
  }
  return Math.max(CHART_AXIS_STEP, Math.ceil(peak / CHART_AXIS_STEP) * CHART_AXIS_STEP);
}

/**
 * Y-axis tick values from the top of the chart down to zero.
 * @param {number} peak Highest category total.
 * @returns {number[]} Tick amounts in BDT.
 */
export function chartAxisTicks(peak) {
  const max = chartAxisMax(peak);
  const ticks = [];
  for (let value = max; value >= 0; value -= CHART_AXIS_STEP) {
    ticks.push(value);
  }
  return ticks;
}

/**
 * Format a transaction timestamp like "Aug 23, 2026".
 * @param {string} isoDate ISO date string.
 * @returns {string} Short local date.
 */
export function formatTxnDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export { formatBdt };
