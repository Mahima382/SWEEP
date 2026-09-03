/**
 * Payout Service (FR-10 — Mobile Banking & Payment).
 *
 * Handles payout validations, minimum thresholds, verified account verification,
 * status tracking, and channel routing.
 */

const MIN_PAYOUT_THRESHOLD = 100;
const SUPPORTED_PAYMENT_CHANNELS = {
  bkash: 'bkash',
  nagad: 'nagad',
  bank_account: 'bank_transfer',
};

class PayoutService {
  /**
   * Initiates a withdrawal / payout request.
   *
   * @param {object} params - Payout initiation parameters.
   * @param {number} params.userId - User ID.
   * @param {number} params.amount - Payout amount.
   * @param {string} params.channel - Channel ('bkash', 'nagad', 'bank_account').
   * @param {string} [params.accountNumber] - Account number.
   * @param {boolean} [params.accountVerified=true] - Whether account is verified.
   * @param {boolean} [params.hasLinkedPayoutMethod=true] - Whether user has linked method.
   * @param {object} [params.bankDetails] - Bank details if channel is bank_account.
   * @returns {Promise<object>} Initiated payout record.
   */
  static async initiatePayout({
    userId,
    amount,
    channel,
    accountNumber,
    accountVerified = true,
    hasLinkedPayoutMethod = true,
    bankDetails = null,
  }) {
    if (hasLinkedPayoutMethod === false) {
      throw new Error('No linked payout method found. Please link a payout method first.');
    }

    if (amount < this.minThreshold) {
      const error = new Error(`Payout amount (${amount}) is below minimum threshold of ${this.minThreshold} BDT`);
      error.minThreshold = this.minThreshold;
      throw error;
    }

    if (accountVerified === false) {
      throw new Error('Payout account is not verified. A verified payout account is required.');
    }

    const gateway = SUPPORTED_PAYMENT_CHANNELS[channel];
    if (!gateway) {
      throw new Error(`Unsupported payment channel: ${channel}`);
    }

    const payoutId = `payout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return {
      payoutId,
      userId,
      amount,
      channel,
      gateway,
      accountNumber,
      bankDetails,
      status: 'Initiated',
      createdAt: new Date(),
    };
  }

  /**
   * Retrieves tracking information and lifecycle history for a payout.
   *
   * @param {string} payoutId - Payout ID.
   * @returns {Promise<object>} Tracking object with status and statusHistory.
   */
  static async getPayoutTracking(payoutId) {
    return {
      payoutId,
      status: 'Initiated',
      statusHistory: [
        { status: 'Initiated', timestamp: new Date() },
      ],
    };
  }

  /**
   * Validates and routes the payment channel to the appropriate gateway adapter.
   *
   * @param {object} params - Channel parameters.
   * @param {string} params.channel - Channel name.
   * @param {number} params.amount - Transaction amount.
   * @param {string} [params.accountNumber] - Account number.
   * @param {object} [params.bankDetails] - Bank details.
   * @returns {Promise<object>} Route information with gateway adapter.
   */
  static async validateAndRouteChannel({
    channel,
    amount,
    accountNumber = null,
    bankDetails = null,
  }) {
    const gateway = SUPPORTED_PAYMENT_CHANNELS[channel];

    if (!gateway) {
      throw new Error(`Unsupported payment channel: ${channel}`);
    }

    return {
      channelSupported: true,
      channel,
      gateway,
      amount,
      accountNumber,
      bankDetails,
    };
  }
}

PayoutService.minThreshold = MIN_PAYOUT_THRESHOLD;

module.exports = PayoutService;
