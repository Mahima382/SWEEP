/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Unit tests for PayoutService (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests payout validations, thresholds, and channel support.
 * Covers:
 * - Test Group 5: Payout (Criteria 25-31)
 * - Test Group 6: Payment Channels (Criteria 32-35)
 */

let payoutService;
try {
  // eslint-disable-next-line global-require
  payoutService = require('../../services/payoutService');
} catch (e) {
  payoutService = {};
}

describe('PayoutService (FR-10 Unit Tests)', () => {
  describe('TEST GROUP 5 — Payout Validations & Verification', () => {
    it('25. A payout above the minimum threshold can be initiated', async () => {
      const payoutData = {
        userId: 120,
        amount: 500, // Above min threshold (e.g., 100 BDT)
        channel: 'bkash',
        accountNumber: '01711000000',
        accountVerified: true,
      };

      const result = await payoutService.initiatePayout(payoutData);

      expect(result).toBeDefined();
      expect(result.status).toBe('Initiated');
      expect(result.amount).toBe(500);
      expect(result.payoutId).toBeDefined();
    });

    it('26. A payout below the minimum threshold is rejected', async () => {
      const payoutData = {
        userId: 120,
        amount: 50, // Below min threshold of 100 BDT
        channel: 'bkash',
        accountNumber: '01711000000',
        accountVerified: true,
      };

      await expect(
        payoutService.initiatePayout(payoutData),
      ).rejects.toThrow(/below minimum threshold/i);
    });

    it('27. The rejection must expose the configured minimum threshold', async () => {
      const payoutData = {
        userId: 120,
        amount: 40,
        channel: 'nagad',
        accountNumber: '01811000000',
        accountVerified: true,
      };

      try {
        await payoutService.initiatePayout(payoutData);
        expect.unreachable('Should have thrown minimum threshold error');
      } catch (err) {
        expect(err.minThreshold).toBeDefined();
        expect(err.minThreshold).toBeGreaterThan(40);
        expect(err.message).toMatch(new RegExp(String(err.minThreshold)));
      }
    });

    it('28. A payout requires a verified bKash number, Nagad number, or bank account', async () => {
      const validBkash = await payoutService.initiatePayout({
        userId: 121,
        amount: 250,
        channel: 'bkash',
        accountNumber: '01711223344',
        accountVerified: true,
      });

      const validNagad = await payoutService.initiatePayout({
        userId: 121,
        amount: 250,
        channel: 'nagad',
        accountNumber: '01811223344',
        accountVerified: true,
      });

      const validBank = await payoutService.initiatePayout({
        userId: 121,
        amount: 5000,
        channel: 'bank_account',
        bankDetails: {
          bankName: 'City Bank',
          accountNumber: '110022334455',
          branch: 'Dhanmondi',
        },
        accountVerified: true,
      });

      expect(validBkash.status).toBe('Initiated');
      expect(validNagad.status).toBe('Initiated');
      expect(validBank.status).toBe('Initiated');
    });

    it('29. An unverified payout account causes the payout to be rejected', async () => {
      const unverifiedPayout = {
        userId: 122,
        amount: 300,
        channel: 'bkash',
        accountNumber: '01799999999',
        accountVerified: false,
      };

      await expect(
        payoutService.initiatePayout(unverifiedPayout),
      ).rejects.toThrow(/payout account is not verified|verified payout account required/i);
    });

    it('30. A user without a linked payout method cannot initiate a payout', async () => {
      const unlinkedUserPayout = {
        userId: 123,
        amount: 400,
        hasLinkedPayoutMethod: false,
      };

      await expect(
        payoutService.initiatePayout(unlinkedUserPayout),
      ).rejects.toThrow(/no linked payout method|link a payout method/i);
    });

    it('31. A valid payout should have a trackable payment/payout status', async () => {
      const payoutTracker = await payoutService.getPayoutTracking('payout-track-001');

      expect(payoutTracker).toHaveProperty('payoutId', 'payout-track-001');
      expect(payoutTracker).toHaveProperty('status');
      expect(['Initiated', 'Processing', 'Completed', 'Failed']).toContain(payoutTracker.status);
      expect(payoutTracker).toHaveProperty('statusHistory');
      expect(Array.isArray(payoutTracker.statusHistory)).toBe(true);
    });
  });

  describe('TEST GROUP 6 — Supported Payment Channels', () => {
    it('32. bKash payment can be initiated', async () => {
      const bkashPayment = await payoutService.validateAndRouteChannel({
        channel: 'bkash',
        amount: 300,
        accountNumber: '01700000001',
      });

      expect(bkashPayment.channelSupported).toBe(true);
      expect(bkashPayment.gateway).toBe('bkash');
    });

    it('33. Nagad payment can be initiated', async () => {
      const nagadPayment = await payoutService.validateAndRouteChannel({
        channel: 'nagad',
        amount: 300,
        accountNumber: '01800000001',
      });

      expect(nagadPayment.channelSupported).toBe(true);
      expect(nagadPayment.gateway).toBe('nagad');
    });

    it('34. Registered bank account payment/payout can be initiated when valid', async () => {
      const bankPayment = await payoutService.validateAndRouteChannel({
        channel: 'bank_account',
        amount: 10000,
        bankDetails: {
          accountNumber: '9876543210',
          routingNumber: '123456789',
        },
      });

      expect(bankPayment.channelSupported).toBe(true);
      expect(bankPayment.gateway).toBe('bank_transfer');
    });

    it('35. Unsupported payment channels are rejected', async () => {
      await expect(
        payoutService.validateAndRouteChannel({ channel: 'paypal', amount: 500 }),
      ).rejects.toThrow(/unsupported payment channel/i);

      await expect(
        payoutService.validateAndRouteChannel({ channel: 'crypto_usdt', amount: 500 }),
      ).rejects.toThrow(/unsupported payment channel/i);

      await expect(
        payoutService.validateAndRouteChannel({ channel: 'stripe', amount: 500 }),
      ).rejects.toThrow(/unsupported payment channel/i);
    });
  });
});
