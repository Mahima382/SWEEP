/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Unit tests for LedgerService (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests immutable financial ledger integrity and structure.
 * Covers:
 * - Test Group 4: Ledger (Criteria 20-24)
 */

let ledgerService;
try {
  // eslint-disable-next-line global-require
  ledgerService = require('../../services/ledgerService');
} catch (e) {
  ledgerService = {};
}

describe('LedgerService (FR-10 Unit Tests)', () => {
  describe('TEST GROUP 4 — Immutable Financial Ledger', () => {
    it('20. A completed financial transaction creates a ledger entry', async () => {
      const transactionData = {
        transactionId: 'tx-fin-101',
        amount: 2000,
        commission: 100,
        netPayout: 1900,
        type: 'waste_lot_payout',
        userId: 130,
      };

      const entry = await ledgerService.recordTransaction(transactionData);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.transactionId).toBe('tx-fin-101');
    });

    it('21. Ledger entry contains transaction ID, amount, commission, net payout, and timestamp', async () => {
      const transactionData = {
        transactionId: 'tx-fin-102',
        amount: 1500,
        commission: 75,
        netPayout: 1425,
        type: 'household_pickup_payment',
        userId: 131,
      };

      const entry = await ledgerService.recordTransaction(transactionData);

      expect(entry.transactionId).toBe('tx-fin-102');
      expect(entry.amount).toBe(1500);
      expect(entry.commission).toBe(75);
      expect(entry.netPayout).toBe(1425);
      expect(entry.timestamp).toBeDefined();
      expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    });

    it('22. Ledger entries cannot be modified after creation', async () => {
      const entry = await ledgerService.recordTransaction({
        transactionId: 'tx-fin-immutable-01',
        amount: 800,
        commission: 40,
        netPayout: 760,
      });

      await expect(
        ledgerService.updateEntry(entry.id, { amount: 1000 }),
      ).rejects.toThrow(/ledger entries are immutable|modification not permitted/i);
    });

    it('23. Ledger entries cannot be deleted after creation', async () => {
      const entry = await ledgerService.recordTransaction({
        transactionId: 'tx-fin-immutable-02',
        amount: 500,
        commission: 25,
        netPayout: 475,
      });

      await expect(
        ledgerService.deleteEntry(entry.id),
      ).rejects.toThrow(/ledger entries cannot be deleted|deletion not permitted/i);
    });

    it('24. A failed payment must not create a successful financial ledger entry', async () => {
      const failedPayment = {
        transactionId: 'tx-failed-999',
        status: 'Failed',
        amount: 600,
        failureReason: 'User declined OTP',
      };

      const result = await ledgerService.handlePaymentResult(failedPayment);

      expect(result.ledgerCreated).toBe(false);

      const entries = await ledgerService.findByTransactionId('tx-failed-999');
      const successfulEntries = entries.filter((e) => e.status !== 'Failed');
      expect(successfulEntries.length).toBe(0);
    });
  });
});
