/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Unit tests for PaymentService (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests business logic in isolation.
 * Covers:
 * - Test Group 1: Wallet Top-Up (Criteria 1-7)
 * - Test Group 2: Payment Status Tracking (Criteria 8-12)
 * - Test Group 7: Gateway Failure & Retry Handling (Criteria 36-40)
 * - Test Group 9: Concurrent Debit & Overdraft Protection (Criteria 46-49)
 * - Test Group 10: Role-Based Payment Flows (Criteria 50-53)
 * - Test Group 11: Notification Integration Contract
 * - Test Group 12: Idempotency Enforcement (Criteria 54-56)
 * - Test Group 13: Error Handling & Atomic Rollback (Criteria 57-63)
 */

let paymentService;
try {
  // eslint-disable-next-line global-require
  paymentService = require('../../services/paymentService');
} catch (e) {
  paymentService = {};
}

describe('PaymentService (FR-10 Unit Tests)', () => {
  describe('TEST GROUP 1 — Wallet Top-Up', () => {
    it('1. A valid wallet top-up should create a payment with status Initiated', async () => {
      const topUpData = {
        userId: 101,
        amount: 500,
        channel: 'bkash',
        idempotencyKey: 'topup-key-001',
      };

      const payment = await paymentService.initiateTopUp(topUpData);

      expect(payment).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(payment.userId).toBe(101);
      expect(payment.amount).toBe(500);
      expect(payment.channel).toBe('bkash');
      expect(payment.status).toBe('Initiated');
      expect(payment.idempotencyKey).toBe('topup-key-001');
    });

    it('2. A successful payment should credit the wallet exactly once', async () => {
      const paymentId = 'pay-topup-001';
      const initialBalance = 100;
      const topUpAmount = 500;

      const result = await paymentService.handleTopUpSuccess({
        paymentId,
        userId: 101,
        amount: topUpAmount,
        initialBalance,
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(600);
      expect(result.creditedTimes).toBe(1);
    });

    it('3. A successful payment should create exactly one immutable ledger entry', async () => {
      const paymentId = 'pay-topup-002';
      const topUpData = {
        paymentId,
        userId: 101,
        amount: 500,
        channel: 'nagad',
      };

      const result = await paymentService.completeTopUp(topUpData);

      expect(result.ledgerEntry).toBeDefined();
      expect(result.ledgerEntry.transactionId).toBe(paymentId);
      expect(result.ledgerEntry.amount).toBe(500);
      expect(result.ledgerEntriesCreated).toBe(1);
    });

    it('4. A failed payment should not change wallet balance', async () => {
      const userId = 101;
      const initialBalance = 250;

      const result = await paymentService.handleTopUpFailure({
        paymentId: 'pay-topup-failed-001',
        userId,
        amount: 500,
        initialBalance,
        reason: 'User cancelled transaction at gateway',
      });

      expect(result.newBalance).toBe(initialBalance);
      expect(result.balanceModified).toBe(false);
    });

    it('5. A failed payment should create the appropriate failed payment state', async () => {
      const paymentId = 'pay-topup-failed-002';

      const payment = await paymentService.markPaymentFailed(
        paymentId,
        'Insufficient balance in mobile wallet',
      );

      expect(payment.status).toBe('Failed');
      expect(payment.failureReason).toBe('Insufficient balance in mobile wallet');
      expect(payment.failedAt).toBeDefined();
    });

    it('6. A duplicate payment request using the same idempotency key must be rejected', async () => {
      const requestData = {
        userId: 101,
        amount: 1000,
        channel: 'bkash',
        idempotencyKey: 'idemp-duplicate-001',
      };

      await paymentService.initiateTopUp(requestData);

      await expect(
        paymentService.initiateTopUp(requestData),
      ).rejects.toThrow(/idempotency/i);
    });

    it('7. Repeated identical gateway webhook callbacks must not double-credit the wallet', async () => {
      const webhookPayload = {
        transactionId: 'gw-tx-001',
        paymentId: 'pay-001',
        userId: 101,
        amount: 300,
        status: 'SUCCESS',
      };

      const firstCall = await paymentService.processGatewayWebhook(webhookPayload);
      const secondCall = await paymentService.processGatewayWebhook(webhookPayload);

      expect(firstCall.credited).toBe(true);
      expect(secondCall.credited).toBe(false);
      expect(secondCall.duplicateIgnored).toBe(true);
    });
  });

  describe('TEST GROUP 2 — Payment Status Lifecycle', () => {
    it('8. New payment starts with status Initiated', async () => {
      const payment = await paymentService.createPayment({
        userId: 102,
        amount: 200,
        type: 'topup',
        channel: 'bkash',
      });

      expect(payment.status).toBe('Initiated');
    });

    it('9. Payment can transition from Initiated to Processing', async () => {
      const payment = await paymentService.updatePaymentStatus('pay-status-001', {
        fromStatus: 'Initiated',
        toStatus: 'Processing',
      });

      expect(payment.status).toBe('Processing');
    });

    it('10. Successful processing transitions payment to Completed', async () => {
      const payment = await paymentService.updatePaymentStatus('pay-status-002', {
        fromStatus: 'Processing',
        toStatus: 'Completed',
      });

      expect(payment.status).toBe('Completed');
    });

    it('11. Failed processing transitions payment to Failed', async () => {
      const payment = await paymentService.updatePaymentStatus('pay-status-003', {
        fromStatus: 'Processing',
        toStatus: 'Failed',
        failureReason: 'Gateway timeout',
      });

      expect(payment.status).toBe('Failed');
    });

    it('12. Invalid payment status transitions must be rejected', async () => {
      await expect(
        paymentService.updatePaymentStatus('pay-status-004', {
          fromStatus: 'Completed',
          toStatus: 'Initiated',
        }),
      ).rejects.toThrow(/invalid status transition/i);

      await expect(
        paymentService.updatePaymentStatus('pay-status-005', {
          fromStatus: 'Completed',
          toStatus: 'Failed',
        }),
      ).rejects.toThrow(/invalid status transition/i);

      await expect(
        paymentService.updatePaymentStatus('pay-status-006', {
          fromStatus: 'Failed',
          toStatus: 'Completed',
        }),
      ).rejects.toThrow(/invalid status transition/i);
    });
  });

  describe('TEST GROUP 7 — Gateway Failure & Retry Handling', () => {
    it('36. Gateway timeout changes the transaction to Processing/PendingRetry', async () => {
      const result = await paymentService.handleGatewayTimeout('pay-timeout-001');

      expect(['Processing', 'PendingRetry']).toContain(result.status);
      expect(result.timeoutHandled).toBe(true);
    });

    it('37. Gateway timeout must not incorrectly deduct funds', async () => {
      const initialBalance = 1500;
      const result = await paymentService.handleGatewayTimeout('pay-timeout-002', {
        userId: 103,
        amount: 500,
        initialBalance,
      });

      expect(result.currentBalance).toBe(initialBalance);
      expect(result.fundsDeducted).toBe(false);
    });

    it('38. Gateway timeout should schedule/trigger retry according to the 5-minute retry requirement', async () => {
      const now = Date.now();
      const retrySchedule = await paymentService.scheduleGatewayRetry('pay-timeout-003', {
        timeoutAt: now,
      });

      expect(retrySchedule.retryScheduled).toBe(true);
      // 5 minutes = 300,000 ms (tolerance ± 1000ms)
      expect(retrySchedule.scheduledRetryTime - now).toBeGreaterThanOrEqual(299000);
      expect(retrySchedule.scheduledRetryTime - now).toBeLessThanOrEqual(301000);
      expect(retrySchedule.retryCount).toBe(1);
    });

    it('39. A successful retry completes the transaction exactly once', async () => {
      const retryResult = await paymentService.executeScheduledRetry('pay-timeout-004');

      expect(retryResult.status).toBe('Completed');
      expect(retryResult.balanceUpdatedTimes).toBe(1);
      expect(retryResult.ledgerEntriesCount).toBe(1);
    });

    it('40. A failed retry must not double-charge or double-credit the wallet', async () => {
      const initialBalance = 800;

      const firstFail = await paymentService.executeScheduledRetry('pay-timeout-fail-001', {
        simulateGatewayFail: true,
        initialBalance,
      });
      const secondFail = await paymentService.executeScheduledRetry('pay-timeout-fail-001', {
        simulateGatewayFail: true,
        initialBalance,
      });

      expect(firstFail.balance).toBe(initialBalance);
      expect(secondFail.balance).toBe(initialBalance);
      expect(secondFail.corruptedBalance).toBe(false);
    });
  });

  describe('TEST GROUP 9 — Concurrent Debit & Overdraft Protection', () => {
    it('46. Concurrent debit requests against the same wallet must not cause an overdraft', async () => {
      const initialBalance = 100;
      const debit1 = { userId: 104, amount: 80, initialBalance };
      const debit2 = { userId: 104, amount: 80, initialBalance };

      const [res1, res2] = await Promise.allSettled([
        paymentService.debitWallet(debit1),
        paymentService.debitWallet(debit2),
      ]);

      const successfulDebits = [res1, res2].filter((r) => r.status === 'fulfilled');
      const rejectedDebits = [res1, res2].filter((r) => r.status === 'rejected');

      expect(successfulDebits.length).toBe(1);
      expect(rejectedDebits.length).toBe(1);
    });

    it('47. Only one conflicting debit should successfully consume the available balance when insufficient funds exist for both', async () => {
      const initialBalance = 150;
      const walletState = { userId: 105, balance: initialBalance };

      const results = await paymentService.executeConcurrentDebits(walletState, [
        { amount: 100, transactionId: 'tx-c1' },
        { amount: 100, transactionId: 'tx-c2' },
      ]);

      expect(results.successfulCount).toBe(1);
      expect(results.failedCount).toBe(1);
      expect(results.remainingBalance).toBe(50);
    });

    it('48. Wallet balance must never become negative', async () => {
      const wallet = { userId: 106, balance: 50 };

      const res = await paymentService.debitWalletWithGuard(wallet, 100);

      expect(res.success).toBe(false);
      expect(res.balance).toBeGreaterThanOrEqual(0);
      expect(res.error).toMatch(/insufficient/i);
    });

    it('49. A rejected concurrent debit must not create an incorrect ledger entry', async () => {
      const wallet = { userId: 107, balance: 60 };

      const outcome = await paymentService.attemptDebitAndLogLedger(wallet, {
        amount: 100,
        transactionId: 'tx-rejected-001',
      });

      expect(outcome.success).toBe(false);
      expect(outcome.ledgerEntryCreated).toBe(false);
    });
  });

  describe('TEST GROUP 10 — Role-Based Payment Flows', () => {
    it('50. Recycling company can initiate payment for a waste lot order (Flow A)', async () => {
      const paymentOrder = {
        payerId: 201,
        payerRole: 'recycling_company',
        orderId: 'waste-lot-order-99',
        wasteLotId: 'lot-88',
        amount: 25000,
        channel: 'bank_account',
      };

      const result = await paymentService.processOrderPayment(paymentOrder);

      expect(result.success).toBe(true);
      expect(result.status).toBe('Initiated');
      expect(result.orderId).toBe('waste-lot-order-99');
      expect(result.payerRole).toBe('recycling_company');
    });

    it('51. Platform payout to local collector is allowed only after required global collector handover confirmation (Flow B)', async () => {
      const handoverConfirmedData = {
        collectorId: 301,
        role: 'local_collector',
        lotId: 'bulk-lot-01',
        amount: 4000,
        handoverConfirmed: true,
      };

      const result = await paymentService.processCollectorPayout(handoverConfirmedData);

      expect(result.success).toBe(true);
      expect(result.status).toBe('Initiated');
      expect(result.recipientId).toBe(301);
    });

    it('52. Platform payout to household is allowed only after required local collector pickup confirmation (Flow C)', async () => {
      const pickupConfirmedData = {
        householdId: 401,
        role: 'household',
        pickupId: 'pickup-req-55',
        amount: 750,
        pickupConfirmed: true,
      };

      const result = await paymentService.processHouseholdPayout(pickupConfirmedData);

      expect(result.success).toBe(true);
      expect(result.status).toBe('Initiated');
      expect(result.recipientId).toBe(401);
    });

    it('53. Payment/payout is rejected when the required confirmation condition has not occurred', async () => {
      const unconfirmedCollectorPayout = {
        collectorId: 301,
        role: 'local_collector',
        lotId: 'bulk-lot-01',
        amount: 4000,
        handoverConfirmed: false,
      };

      const unconfirmedHouseholdPayout = {
        householdId: 401,
        role: 'household',
        pickupId: 'pickup-req-55',
        amount: 750,
        pickupConfirmed: false,
      };

      await expect(
        paymentService.processCollectorPayout(unconfirmedCollectorPayout),
      ).rejects.toThrow(/handover confirmation required/i);

      await expect(
        paymentService.processHouseholdPayout(unconfirmedHouseholdPayout),
      ).rejects.toThrow(/pickup confirmation required/i);
    });
  });

  describe('TEST GROUP 11 — Notification Integration Contract', () => {
    it('verifies failed payment requests a user notification with mocked notification service', async () => {
      const mockNotificationService = {
        sendNotification: vi.fn().mockResolvedValue({ id: 1 }),
      };

      await paymentService.handlePaymentFailureWithNotification(
        {
          paymentId: 'pay-fail-notif-001',
          userId: 108,
          amount: 500,
          reason: 'Insufficient funds at gateway',
        },
        { notificationService: mockNotificationService },
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 108,
          type: expect.stringMatching(/payment_failed|error/i),
          message: expect.stringMatching(/failed/i),
          referenceType: 'payment',
          referenceId: 'pay-fail-notif-001',
        }),
      );
    });

    it('verifies successful payment can trigger appropriate payment confirmation notification', async () => {
      const mockNotificationService = {
        sendNotification: vi.fn().mockResolvedValue({ id: 2 }),
      };

      await paymentService.handlePaymentSuccessWithNotification(
        {
          paymentId: 'pay-succ-notif-001',
          userId: 108,
          amount: 1200,
        },
        { notificationService: mockNotificationService },
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 108,
          type: expect.stringMatching(/payment_success|payment_received/i),
          referenceType: 'payment',
          referenceId: 'pay-succ-notif-001',
        }),
      );
    });

    it('verifies payout status changes trigger appropriate notification', async () => {
      const mockNotificationService = {
        sendNotification: vi.fn().mockResolvedValue({ id: 3 }),
      };

      await paymentService.notifyPayoutStatusChange(
        {
          payoutId: 'payout-notif-001',
          userId: 109,
          status: 'Completed',
          amount: 3500,
        },
        { notificationService: mockNotificationService },
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 109,
          type: expect.stringMatching(/payout_status|payout/i),
          referenceType: 'payout',
        }),
      );
    });
  });

  describe('TEST GROUP 12 — Idempotency Enforcement', () => {
    it('54. Same idempotency key + same request must process only once', async () => {
      const idempotentRequest = {
        idempotencyKey: 'idem-key-999',
        userId: 110,
        amount: 600,
        channel: 'bkash',
      };

      const res1 = await paymentService.processIdempotentPayment(idempotentRequest);
      const res2 = await paymentService.processIdempotentPayment(idempotentRequest);

      expect(res1.transactionId).toBe(res2.transactionId);
      expect(res2.isReplay).toBe(true);
    });

    it('55. Same idempotency key + conflicting payment data must be rejected', async () => {
      const originalRequest = {
        idempotencyKey: 'idem-conflict-key',
        userId: 110,
        amount: 600,
        channel: 'bkash',
      };

      const conflictingRequest = {
        idempotencyKey: 'idem-conflict-key',
        userId: 110,
        amount: 800, // Conflict: different amount
        channel: 'nagad',
      };

      await paymentService.processIdempotentPayment(originalRequest);

      await expect(
        paymentService.processIdempotentPayment(conflictingRequest),
      ).rejects.toThrow(/idempotency key conflict/i);
    });

    it('56. Duplicate requests must not create duplicate credits, payouts, or ledger entries', async () => {
      const requestData = {
        idempotencyKey: 'idem-no-dupes-001',
        userId: 111,
        amount: 450,
        type: 'topup',
      };

      const stats = await paymentService.executeIdempotentWorkflow(requestData);
      const statsReplay = await paymentService.executeIdempotentWorkflow(requestData);

      expect(stats.walletCreditsCreated).toBe(1);
      expect(stats.ledgerEntriesCreated).toBe(1);
      expect(statsReplay.walletCreditsCreated).toBe(0);
      expect(statsReplay.ledgerEntriesCreated).toBe(0);
    });
  });

  describe('TEST GROUP 13 — Error Handling & Validation', () => {
    it('57. Missing required payment data is rejected', async () => {
      await expect(
        paymentService.initiateTopUp({ amount: 500 }),
      ).rejects.toThrow(/missing required/i);

      await expect(
        paymentService.initiateTopUp({ userId: 112 }),
      ).rejects.toThrow(/missing required/i);
    });

    it('58. Invalid amount (non-numeric / NaN) is rejected', async () => {
      await expect(
        paymentService.initiateTopUp({ userId: 112, amount: 'five-hundred', channel: 'bkash' }),
      ).rejects.toThrow(/invalid amount/i);

      await expect(
        paymentService.initiateTopUp({ userId: 112, amount: NaN, channel: 'bkash' }),
      ).rejects.toThrow(/invalid amount/i);
    });

    it('59. Zero amount is rejected', async () => {
      await expect(
        paymentService.initiateTopUp({ userId: 112, amount: 0, channel: 'bkash' }),
      ).rejects.toThrow(/amount must be greater than zero/i);
    });

    it('60. Negative amount is rejected', async () => {
      await expect(
        paymentService.initiateTopUp({ userId: 112, amount: -150, channel: 'bkash' }),
      ).rejects.toThrow(/amount must be greater than zero|positive amount/i);
    });

    it('61. Invalid payment method is rejected', async () => {
      await expect(
        paymentService.initiateTopUp({ userId: 112, amount: 500, channel: 'unsupported_method' }),
      ).rejects.toThrow(/unsupported payment channel|invalid payment method/i);
    });

    it('62. Invalid wallet/user reference is handled safely', async () => {
      await expect(
        paymentService.initiateTopUp({ userId: 9999999, amount: 500, channel: 'bkash' }),
      ).rejects.toThrow(/user not found|wallet not found/i);
    });

    it('63. Internal payment processing failure must not partially modify wallet balance', async () => {
      const initialBalance = 1000;

      const rollbackTest = await paymentService.executeAtomicPaymentWithFailure({
        userId: 113,
        amount: 400,
        initialBalance,
        failAtStep: 'LEDGER_CREATION',
      });

      expect(rollbackTest.rolledBack).toBe(true);
      expect(rollbackTest.finalBalance).toBe(initialBalance);
    });
  });
});
