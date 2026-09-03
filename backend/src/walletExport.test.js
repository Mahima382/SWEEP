const { demoTransactions, summarizeWallet } = require('./walletLedger');
const { buildWalletCsv, buildWalletPdf } = require('./walletExport');

describe('walletExport (FR-04)', () => {
  it('builds a CSV that includes totals and transaction ids', () => {
    const rows = demoTransactions();
    const csv = buildWalletCsv(rows, summarizeWallet(rows));
    expect(csv).toContain('SWEEP household wallet');
    expect(csv).toContain('TXN-7721');
    expect(csv).toContain('WD-7700');
    expect(csv).toContain('Available,2850');
  });

  it('escapes commas and quotes inside CSV cells', () => {
    const csv = buildWalletCsv([
      {
        id: 'TXN-1',
        type: 'earning',
        status: 'available',
        amountBdt: 10,
        reference: 'PH-1, "Plastic"',
        createdAt: '2026-08-23T10:00:00.000Z',
      },
    ], { pendingBdt: 0, availableBdt: 10, earnedBdt: 10 });
    expect(csv).toContain('"PH-1, ""Plastic"""');
  });

  it('builds a PDF document with the ledger text', () => {
    const rows = demoTransactions();
    const pdf = buildWalletPdf(rows, summarizeWallet(rows));
    expect(pdf.slice(0, 8)).toBe('%PDF-1.4');
    expect(pdf).toContain('TXN-7721');
    expect(pdf).toContain('%%EOF');
  });
});
