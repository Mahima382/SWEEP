import {
  buildWalletCsv,
  buildWalletPdf,
} from './walletExport';
import { demoTransactions, summarizeWallet } from './wallet';

describe('wallet export helpers (FR-04 segment 2)', () => {
  it('builds a CSV that includes totals and transaction ids', () => {
    const rows = demoTransactions();
    const csv = buildWalletCsv(rows, summarizeWallet(rows));
    expect(csv).toContain('SWEEP household wallet');
    expect(csv).toContain('TXN-7721');
    expect(csv).toContain('WD-7700');
    expect(csv).toContain('Available,2850');
  });

  it('builds a PDF document with the ledger text', () => {
    const rows = demoTransactions();
    const pdf = buildWalletPdf(rows, summarizeWallet(rows));
    expect(pdf.slice(0, 8)).toBe('%PDF-1.4');
    expect(pdf).toContain('TXN-7721');
    expect(pdf).toContain('%%EOF');
  });
});
