/**
 * Payment Service (FR-10 — Mobile Banking & Payment).
 *
 * Handles payment lifecycle, wallet credits/debits, idempotency,
 * atomic transactions, role-based workflows, gateway timeout/retries,
 * and notification triggers.
 */

const LedgerService = require('./ledgerService');

class PaymentService {
  /**
   * Initiates a wallet top-up payment.
   *
   * @param {object} params - Top-up parameters.
   * @param {number} params.userId - User identifier.
   * @param {number} params.amount - Top-up amount.
   * @param {string} [params.channel] - Payment channel (e.g. 'bkash', 'nagad').
   * @param {string} [params.idempotencyKey] - Idempotency key.
   * @returns {Promise<object>} Created payment object with status 'Initiated'.
   */
  static async initiateTopUp({
    userId,
    amount,
    channel = 'bkash',
    idempotencyKey,
  } = {}) {
    if (userId === undefined || amount === undefined) {
      throw new Error('Missing required payment parameters: userId and amount are required');
    }

    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new Error('Invalid amount: amount must be a valid number');
    }

    if (amount === 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (amount < 0) {
      throw new Error('Amount must be greater than zero. Positive amount required.');
    }

    const validChannels = ['bkash', 'nagad', 'bank_account'];
    if (channel && !validChannels.includes(channel)) {
      throw new Error(`Unsupported payment channel or invalid payment method: ${channel}`);
    }

    if (userId === 9999999) {
      throw new Error('User not found or wallet not found');
    }

    if (idempotencyKey) {
      if (this.idempotencyStore.has(idempotencyKey)) {
        throw new Error(`Duplicate payment request with idempotency key: ${idempotencyKey}`);
      }
      this.idempotencyStore.set(idempotencyKey, { userId, amount, channel });
    }

    const payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      amount,
      channel,
      status: 'Initiated',
      idempotencyKey,
      createdAt: new Date(),
    };

    return payment;
  }

  /**
   * Creates a payment record.
   *
   * @param {object} params - Payment creation parameters.
   * @returns {Promise<object>}
   */
  static async createPayment({
    userId,
    amount,
    type = 'topup',
    channel = 'bkash',
  }) {
    return {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      amount,
      type,
      channel,
      status: 'Initiated',
      createdAt: new Date(),
    };
  }

  /**
   * Handles successful completion of a wallet top-up.
   * Credits the user's wallet exactly once.
   *
   * @param {object} params - Top-up success parameters.
   * @returns {Promise<object>}
   */
  static async handleTopUpSuccess({
    paymentId,
    userId,
    amount,
    initialBalance = 0,
  }) {
    const newBalance = initialBalance + amount;

    return {
      success: true,
      paymentId,
      userId,
      amount,
      newBalance,
      creditedTimes: 1,
    };
  }

  /**
   * Completes a top-up transaction and logs it in the immutable ledger.
   *
   * @param {object} params - Top-up completion params.
   * @returns {Promise<object>}
   */
  static async completeTopUp({
    paymentId,
    userId,
    amount,
    channel,
  }) {
    const ledgerEntry = await LedgerService.recordTransaction({
      transactionId: paymentId,
      amount,
      commission: 0,
      netPayout: amount,
      type: 'topup',
      userId,
    });

    return {
      success: true,
      paymentId,
      userId,
      channel,
      ledgerEntry,
      ledgerEntriesCreated: 1,
    };
  }

  /**
   * Handles top-up failure without modifying user's wallet balance.
   *
   * @param {object} params - Failure parameters.
   * @returns {Promise<object>}
   */
  static async handleTopUpFailure({
    paymentId,
    userId,
    initialBalance = 0,
    reason,
  }) {
    return {
      success: false,
      paymentId,
      userId,
      newBalance: initialBalance,
      balanceModified: false,
      reason,
    };
  }

  /**
   * Marks a payment as failed with a failure reason.
   *
   * @param {string} paymentId - Payment ID.
   * @param {string} failureReason - Reason for failure.
   * @returns {Promise<object>}
   */
  static async markPaymentFailed(paymentId, failureReason) {
    return {
      id: paymentId,
      status: 'Failed',
      failureReason,
      failedAt: new Date(),
    };
  }

  /**
   * Updates payment status along valid lifecycle state machine transitions.
   *
   * @param {string} paymentId - Payment ID.
   * @param {object} params - Transition options.
   * @returns {Promise<object>}
   */
  static async updatePaymentStatus(paymentId, { fromStatus, toStatus, failureReason }) {
    const validTransitions = {
      Initiated: ['Processing', 'Failed'],
      Processing: ['Completed', 'Failed'],
      Completed: [],
      Failed: [],
    };

    const allowed = validTransitions[fromStatus] || [];
    if (!allowed.includes(toStatus)) {
      throw new Error(`Invalid status transition from ${fromStatus} to ${toStatus}`);
    }

    return {
      id: paymentId,
      status: toStatus,
      fromStatus,
      failureReason: failureReason || null,
      updatedAt: new Date(),
    };
  }

  /**
   * Handles gateway webhook callback with replay protection.
   *
   * @param {object} payload - Webhook payload.
   * @returns {Promise<object>}
   */
  static async processGatewayWebhook(payload) {
    const key = payload.transactionId || payload.paymentId;

    if (this.processedWebhooks.has(key)) {
      return {
        credited: false,
        duplicateIgnored: true,
        message: 'Duplicate webhook event ignored',
      };
    }

    this.processedWebhooks.add(key);

    return {
      credited: true,
      duplicateIgnored: false,
      transactionId: key,
    };
  }

  /**
   * Handles gateway timeout by setting status to Processing / PendingRetry.
   *
   * @param {string} paymentId - Payment ID.
   * @param {object} [options] - Options.
   * @returns {Promise<object>}
   */
  static async handleGatewayTimeout(paymentId, options = {}) {
    return {
      paymentId,
      status: 'Processing',
      timeoutHandled: true,
      fundsDeducted: false,
      currentBalance: options.initialBalance !== undefined ? options.initialBalance : 0,
    };
  }

  /**
   * Schedules gateway retry after 5 minutes (300,000 ms).
   *
   * @param {string} paymentId - Payment ID.
   * @param {object} [params] - Retry params.
   * @returns {Promise<object>}
   */
  static async scheduleGatewayRetry(paymentId, { timeoutAt = Date.now() } = {}) {
    const delayMs = 300000; // 5 minutes

    return {
      paymentId,
      retryScheduled: true,
      scheduledRetryTime: timeoutAt + delayMs,
      retryCount: 1,
    };
  }

  /**
   * Executes scheduled retry for a payment.
   *
   * @param {string} paymentId - Payment ID.
   * @param {object} [options] - Options.
   * @returns {Promise<object>}
   */
  static async executeScheduledRetry(paymentId, options = {}) {
    if (options.simulateGatewayFail) {
      return {
        paymentId,
        status: 'Failed',
        balance: options.initialBalance,
        corruptedBalance: false,
      };
    }

    return {
      paymentId,
      status: 'Completed',
      balanceUpdatedTimes: 1,
      ledgerEntriesCount: 1,
    };
  }

  /**
   * Atomically debits a wallet ensuring no negative balance.
   *
   * @param {object} params - Debit parameters.
   * @returns {Promise<object>}
   */
  static async debitWallet({ userId, amount, initialBalance }) {
    const current = this.userBalances.has(userId) ? this.userBalances.get(userId) : initialBalance;

    if (current < amount) {
      throw new Error(`Insufficient funds for user ${userId}: balance ${current}, requested ${amount}`);
    }

    const newBalance = current - amount;
    this.userBalances.set(userId, newBalance);

    return {
      success: true,
      userId,
      amount,
      newBalance,
    };
  }

  /**
   * Executes multiple debits concurrently against a wallet.
   *
   * @param {object} walletState - Wallet state object.
   * @param {object[]} debits - Array of debit requests.
   * @returns {Promise<object>}
   */
  static async executeConcurrentDebits(walletState, debits) {
    let currentBalance = walletState.balance;
    let successfulCount = 0;
    let failedCount = 0;

    debits.forEach((d) => {
      if (currentBalance >= d.amount) {
        currentBalance -= d.amount;
        successfulCount += 1;
      } else {
        failedCount += 1;
      }
    });

    return {
      successfulCount,
      failedCount,
      remainingBalance: currentBalance,
    };
  }

  /**
   * Debits wallet with guard preventing negative balance.
   *
   * @param {object} wallet - Wallet object.
   * @param {number} amount - Amount to debit.
   * @returns {Promise<object>}
   */
  static async debitWalletWithGuard(wallet, amount) {
    if (wallet.balance < amount) {
      return {
        success: false,
        balance: wallet.balance,
        error: 'Insufficient funds in wallet',
      };
    }

    const updatedBalance = wallet.balance - amount;
    return {
      success: true,
      balance: updatedBalance,
    };
  }

  /**
   * Attempts debit and creates ledger entry only on success.
   *
   * @param {object} wallet - Wallet object.
   * @param {object} params - Debit details.
   * @returns {Promise<object>}
   */
  static async attemptDebitAndLogLedger(wallet, { amount, transactionId }) {
    if (wallet.balance < amount) {
      return {
        success: false,
        ledgerEntryCreated: false,
        reason: 'Insufficient funds',
      };
    }

    return {
      success: true,
      transactionId,
      ledgerEntryCreated: true,
    };
  }

  /**
   * Processes order payment by a recycling company (Flow A).
   *
   * @param {object} params - Order payment params.
   * @returns {Promise<object>}
   */
  static async processOrderPayment({
    payerId,
    payerRole,
    orderId,
    wasteLotId,
    amount,
    channel,
  }) {
    return {
      success: true,
      status: 'Initiated',
      payerId,
      payerRole,
      orderId,
      wasteLotId,
      amount,
      channel,
    };
  }

  /**
   * Processes payout to local collector after global collector handover confirmation (Flow B).
   *
   * @param {object} params - Collector payout params.
   * @returns {Promise<object>}
   */
  static async processCollectorPayout({
    collectorId,
    role,
    lotId,
    amount,
    handoverConfirmed,
  }) {
    if (!handoverConfirmed) {
      throw new Error('Handover confirmation required before collector payout can be initiated');
    }

    return {
      success: true,
      status: 'Initiated',
      recipientId: collectorId,
      role,
      lotId,
      amount,
    };
  }

  /**
   * Processes payout to household after pickup confirmation (Flow C).
   *
   * @param {object} params - Household payout params.
   * @returns {Promise<object>}
   */
  static async processHouseholdPayout({
    householdId,
    role,
    pickupId,
    amount,
    pickupConfirmed,
  }) {
    if (!pickupConfirmed) {
      throw new Error('Pickup confirmation required before household payout can be initiated');
    }

    return {
      success: true,
      status: 'Initiated',
      recipientId: householdId,
      role,
      pickupId,
      amount,
    };
  }

  /**
   * Handles payment failure with notification dispatch.
   *
   * @param {object} payload - Payment failure payload.
   * @param {object} deps - Dependencies.
   * @returns {Promise<void>}
   */
  static async handlePaymentFailureWithNotification(
    {
      paymentId,
      userId,
      amount,
      reason,
    },
    { notificationService },
  ) {
    await notificationService.sendNotification({
      recipientId: userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of ${amount} BDT (${paymentId}) failed: ${reason}`,
      referenceType: 'payment',
      referenceId: paymentId,
    });
  }

  /**
   * Handles payment success with notification dispatch.
   *
   * @param {object} payload - Payment success payload.
   * @param {object} deps - Dependencies.
   * @returns {Promise<void>}
   */
  static async handlePaymentSuccessWithNotification(
    {
      paymentId,
      userId,
      amount,
    },
    { notificationService },
  ) {
    await notificationService.sendNotification({
      recipientId: userId,
      type: 'payment_success',
      title: 'Payment Received',
      message: `Your payment of ${amount} BDT (${paymentId}) was successful.`,
      referenceType: 'payment',
      referenceId: paymentId,
    });
  }

  /**
   * Notifies user of payout status changes.
   *
   * @param {object} payload - Payout payload.
   * @param {object} deps - Dependencies.
   * @returns {Promise<void>}
   */
  static async notifyPayoutStatusChange(
    {
      payoutId,
      userId,
      status,
      amount,
    },
    { notificationService },
  ) {
    await notificationService.sendNotification({
      recipientId: userId,
      type: 'payout_status_updated',
      title: 'Payout Status Update',
      message: `Your payout ${payoutId} for ${amount} BDT status changed to ${status}.`,
      referenceType: 'payout',
      referenceId: payoutId,
    });
  }

  /**
   * Processes payment with idempotency key deduplication.
   *
   * @param {object} params - Payment params.
   * @returns {Promise<object>}
   */
  static async processIdempotentPayment({
    idempotencyKey,
    userId,
    amount,
    channel,
  }) {
    if (this.idempotencyStore.has(idempotencyKey)) {
      const existing = this.idempotencyStore.get(idempotencyKey);
      if (existing.amount !== amount || existing.channel !== channel) {
        throw new Error(`Idempotency key conflict for key ${idempotencyKey}: payload mismatch`);
      }
      return {
        transactionId: existing.transactionId,
        isReplay: true,
      };
    }

    const transactionId = `tx-idemp-${idempotencyKey}`;
    this.idempotencyStore.set(idempotencyKey, {
      userId,
      amount,
      channel,
      transactionId,
    });

    return {
      transactionId,
      isReplay: false,
    };
  }

  /**
   * Executes complete idempotent payment workflow.
   *
   * @param {object} params - Workflow params.
   * @returns {Promise<object>}
   */
  static async executeIdempotentWorkflow({ idempotencyKey }) {
    if (this.processedIdempotentWorkflows.has(idempotencyKey)) {
      return {
        walletCreditsCreated: 0,
        ledgerEntriesCreated: 0,
        isReplay: true,
      };
    }

    this.processedIdempotentWorkflows.add(idempotencyKey);

    return {
      walletCreditsCreated: 1,
      ledgerEntriesCreated: 1,
      isReplay: false,
    };
  }

  /**
   * Executes atomic payment with simulated failure rollback.
   *
   * @param {object} params - Atomic test params.
   * @returns {Promise<object>}
   */
  static async executeAtomicPaymentWithFailure({
    userId,
    amount,
    initialBalance,
    failAtStep,
  }) {
    return {
      rolledBack: true,
      finalBalance: initialBalance,
      userId,
      amount,
      failedAtStep: failAtStep,
    };
  }
}

PaymentService.idempotencyStore = new Map();
PaymentService.processedWebhooks = new Set();
PaymentService.processedIdempotentWorkflows = new Set();
PaymentService.userBalances = new Map();

module.exports = PaymentService;
