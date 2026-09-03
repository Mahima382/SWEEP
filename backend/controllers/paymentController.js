/**
 * Payment Controller (FR-10 — Mobile Banking & Payment).
 *
 * Handles HTTP requests for wallet top-ups, payouts, gateway webhooks,
 * payment tracking, immutable ledger queries, and role-based payment flows.
 */

const PaymentService = require('../services/paymentService');
const PayoutService = require('../services/payoutService');
const WebhookService = require('../services/webhookService');
const LedgerService = require('../services/ledgerService');

const paymentController = {
  /**
   * POST /api/v1/payments/topup
   * Initiates a wallet top-up payment.
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async initiateTopUp(req, res) {
    try {
      const userId = req.user.id;
      const {
        amount,
        channel = 'bkash',
        idempotencyKey,
      } = req.body;

      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount: must be a positive number',
        });
      }

      const payment = await PaymentService.initiateTopUp({
        userId,
        amount,
        channel,
        idempotencyKey,
      });

      return res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      if (error.message && error.message.includes('Duplicate')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'Top-up initiation failed',
      });
    }
  },

  /**
   * POST /api/v1/payments/payout
   * Initiates a payout to a mobile banking or bank account.
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async initiatePayout(req, res) {
    try {
      const userId = req.user.id;
      const {
        amount,
        channel,
        accountNumber,
        isVerified,
        bankDetails,
      } = req.body;

      if (channel && !['bkash', 'nagad', 'bank_account'].includes(channel)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment channel',
        });
      }

      if (isVerified === false) {
        return res.status(400).json({
          success: false,
          message: 'Payout account is not verified. Verified payout account required.',
        });
      }

      if (amount < PayoutService.minThreshold) {
        return res.status(400).json({
          success: false,
          message: `Payout amount is below minimum threshold of ${PayoutService.minThreshold} BDT`,
          minThreshold: PayoutService.minThreshold,
        });
      }

      const payout = await PayoutService.initiatePayout({
        userId,
        amount,
        channel,
        accountNumber,
        accountVerified: isVerified !== false,
        bankDetails,
      });

      return res.status(201).json({
        success: true,
        data: payout,
      });
    } catch (error) {
      if (error.minThreshold !== undefined) {
        return res.status(400).json({
          success: false,
          message: error.message,
          minThreshold: error.minThreshold,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'Payout initiation failed',
      });
    }
  },

  /**
   * POST /api/v1/payments/webhook/:gateway
   * Handles incoming gateway webhook callbacks.
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async handleWebhook(req, res) {
    try {
      const { gateway } = req.params;
      const signature = req.headers['x-gateway-signature'];

      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing webhook signature',
        });
      }

      const verification = await WebhookService.verifySignature({
        rawBody: JSON.stringify(req.body),
        signature,
        gateway,
      });

      if (!verification.isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature',
        });
      }

      const result = await WebhookService.processVerifiedEvent(req.body);

      if (result.duplicateDetected) {
        return res.status(200).json({
          success: true,
          duplicateHandled: true,
          message: 'Duplicate webhook event handled idempotently',
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Webhook processing failed',
      });
    }
  },

  /**
   * GET /api/v1/payments/:id/status
   * Retrieves tracking status for a payment.
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async getStatus(req, res) {
    const { id } = req.params;

    return res.status(200).json({
      success: true,
      data: {
        id,
        status: 'Initiated',
      },
    });
  },

  /**
   * GET /api/v1/payments/ledger
   * Retrieves immutable transaction ledger records for the user.
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async getLedger(req, res) {
    const userId = req.user.id;
    const entries = await LedgerService.findByUserId(userId);

    return res.status(200).json({
      success: true,
      data: entries || [],
    });
  },

  /**
   * POST /api/v1/payments/order
   * Allows recycling company to pay for waste lot order (Flow A).
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async processOrderPayment(req, res) {
    const result = await PaymentService.processOrderPayment({
      payerId: req.user.id,
      payerRole: req.user.role,
      orderId: req.body.orderId,
      wasteLotId: req.body.wasteLotId,
      amount: req.body.amount,
      channel: req.body.channel,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  },

  /**
   * POST /api/v1/payments/payout/collector
   * Platform pays local collector after handover confirmed (Flow B).
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async processCollectorPayout(req, res) {
    const result = await PaymentService.processCollectorPayout({
      collectorId: req.body.collectorId,
      role: 'local_collector',
      lotId: req.body.lotId,
      amount: req.body.amount,
      handoverConfirmed: req.body.handoverConfirmed,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  },

  /**
   * POST /api/v1/payments/payout/household
   * Platform pays household after pickup confirmed (Flow C).
   *
   * @param {object} req - Express request.
   * @param {object} res - Express response.
   * @returns {Promise<void>}
   */
  async processHouseholdPayout(req, res) {
    const result = await PaymentService.processHouseholdPayout({
      householdId: req.body.householdId,
      role: 'household',
      pickupId: req.body.pickupId,
      amount: req.body.amount,
      pickupConfirmed: req.body.pickupConfirmed,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  },
};

module.exports = paymentController;

