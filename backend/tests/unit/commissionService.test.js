/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Unit tests for CommissionService (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests commission calculations and policies.
 * Covers:
 * - Test Group 3: Commission (Criteria 13-19)
 */

let commissionService;
try {
  // eslint-disable-next-line global-require
  commissionService = require('../../services/commissionService');
} catch (e) {
  commissionService = {};
}

describe('CommissionService (FR-10 Unit Tests)', () => {
  describe('TEST GROUP 3 — Commission Calculation & Policies', () => {
    it('13. Commission is calculated automatically from the configured commission rate', async () => {
      const calculation = await commissionService.calculateCommission({
        amount: 1000,
        rate: 0.05,
      });

      expect(calculation.grossAmount).toBe(1000);
      expect(calculation.commissionRate).toBe(0.05);
      expect(calculation.commissionAmount).toBe(50);
      expect(calculation.netAmount).toBe(950);
    });

    it('14. Commission is deducted before payout', async () => {
      const payoutGross = 2500;
      const commissionRate = 0.10; // 10%

      const payoutBreakdown = await commissionService.deductCommissionForPayout({
        grossAmount: payoutGross,
        rate: commissionRate,
      });

      expect(payoutBreakdown.deductedCommission).toBe(250);
      expect(payoutBreakdown.netPayout).toBe(2250);
      expect(payoutBreakdown.netPayout + payoutBreakdown.deductedCommission).toBe(payoutGross);
    });

    it('15. Different transaction types can use different commission rates', async () => {
      const wasteLotOrderRate = await commissionService.getRateForTransactionType('waste_lot_order');
      const householdPickupRate = await commissionService.getRateForTransactionType('household_pickup');
      const subscriptionRate = await commissionService.getRateForTransactionType('subscription');

      expect(wasteLotOrderRate).toBeDefined();
      expect(householdPickupRate).toBeDefined();
      expect(subscriptionRate).toBeDefined();
      expect(wasteLotOrderRate).not.toBe(householdPickupRate);
    });

    it('16. Different waste categories can use different commission rates', async () => {
      const plasticRate = await commissionService.getRateForCategory('Plastic');
      const eWasteRate = await commissionService.getRateForCategory('E-waste');
      const metalRate = await commissionService.getRateForCategory('Metal');
      const organicRate = await commissionService.getRateForCategory('Organic');

      expect(plasticRate).toBeDefined();
      expect(eWasteRate).toBeDefined();
      expect(metalRate).toBeDefined();
      expect(organicRate).toBeDefined();
      expect(eWasteRate).toBeGreaterThan(organicRate);
    });

    it('17. Updating the commission rate affects new transactions', async () => {
      const category = 'Plastic';
      const initialCalc = await commissionService.calculateForCategory({
        category,
        amount: 1000,
      });

      await commissionService.updateCategoryRate(category, 0.08); // 8%

      const updatedCalc = await commissionService.calculateForCategory({
        category,
        amount: 1000,
      });

      expect(updatedCalc.commissionRate).toBe(0.08);
      expect(updatedCalc.commissionAmount).toBe(80);
      expect(updatedCalc.netAmount).toBe(920);
      expect(updatedCalc.commissionAmount).not.toBe(initialCalc.commissionAmount);
    });

    it('18. Historical transactions retain the commission rate that was applied when they were created', async () => {
      const historicalTx = {
        id: 'tx-hist-001',
        category: 'Plastic',
        amount: 1000,
        commissionRate: 0.05,
        commissionAmount: 50,
        netAmount: 950,
        createdAt: new Date('2026-01-15T10:00:00Z'),
      };

      // Admin updates rate later to 12%
      await commissionService.updateCategoryRate('Plastic', 0.12);

      const retrievedTx = await commissionService.getTransactionCommissionSnapshot('tx-hist-001', historicalTx);

      expect(retrievedTx.commissionRate).toBe(0.05);
      expect(retrievedTx.commissionAmount).toBe(50);
      expect(retrievedTx.netAmount).toBe(950);
    });

    it('19. Commission details appear in the transaction/ledger information', async () => {
      const txDetails = await commissionService.formatLedgerCommissionDetails({
        amount: 3000,
        rate: 0.06,
        transactionType: 'waste_lot_order',
        category: 'Metal',
      });

      expect(txDetails).toHaveProperty('grossAmount', 3000);
      expect(txDetails).toHaveProperty('commissionRate', 0.06);
      expect(txDetails).toHaveProperty('commissionAmount', 180);
      expect(txDetails).toHaveProperty('netPayout', 2820);
      expect(txDetails).toHaveProperty('category', 'Metal');
    });
  });
});
