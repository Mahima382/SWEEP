import {
  TXN_STATUS,
  TXN_TYPE,
  chartAxisMax,
  chartAxisTicks,
  chartCategoryTotals,
  completedPickupCount,
  demoTransactions,
  earningsByCategory,
  summarizeWallet,
} from './wallet';

describe('wallet helpers (FR-04 segment 1)', () => {
  it('splits pending vs available after a completed withdrawal', () => {
    const summary = summarizeWallet([
      {
        type: TXN_TYPE.EARNING,
        status: TXN_STATUS.PENDING,
        amountBdt: 100,
      },
      {
        type: TXN_TYPE.EARNING,
        status: TXN_STATUS.AVAILABLE,
        amountBdt: 400,
      },
      {
        type: TXN_TYPE.WITHDRAWAL,
        status: TXN_STATUS.COMPLETED,
        amountBdt: 150,
      },
    ]);
    expect(summary.pendingBdt).toBe(100);
    expect(summary.availableBdt).toBe(250);
    expect(summary.earnedBdt).toBe(500);
  });

  it('groups earnings by category for the breakdown', () => {
    const rows = earningsByCategory([
      {
        type: TXN_TYPE.EARNING,
        category: 'Plastic',
        amountBdt: 80,
      },
      {
        type: TXN_TYPE.EARNING,
        category: 'Plastic',
        amountBdt: 20,
      },
      {
        type: TXN_TYPE.EARNING,
        category: 'Paper',
        amountBdt: 50,
      },
      {
        type: TXN_TYPE.WITHDRAWAL,
        category: null,
        amountBdt: 10,
      },
    ]);
    expect(rows[0]).toEqual({ category: 'Plastic', amountBdt: 100 });
    expect(rows[1]).toEqual({ category: 'Paper', amountBdt: 50 });
  });

  it('demo ledger matches the household wallet mockup totals', () => {
    const rows = demoTransactions();
    const summary = summarizeWallet(rows);
    expect(summary.pendingBdt).toBe(620);
    expect(summary.availableBdt).toBe(2850);
    expect(summary.earnedBdt).toBe(8750);
    expect(completedPickupCount(rows)).toBe(14);
  });

  it('fills every chart category including zeros', () => {
    const rows = chartCategoryTotals([
      {
        type: TXN_TYPE.EARNING,
        category: 'Plastic',
        amountBdt: 100,
      },
    ]);
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({ category: 'Plastic', amountBdt: 100 });
    expect(rows.find((row) => row.category === 'Organic').amountBdt).toBe(0);
    expect(chartAxisMax(3300)).toBe(4000);
    expect(chartAxisTicks(3300)[0]).toBe(4000);
    expect(chartAxisTicks(3300).at(-1)).toBe(0);
  });
});
