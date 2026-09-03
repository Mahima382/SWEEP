/**
 * Payment Routes (FR-10 — Mobile Banking & Payment).
 *
 * REST API routes for wallet top-ups, payouts, webhooks,
 * payment tracking, immutable ledger, and role-based payment flows.
 */

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Top-up
router.post('/topup', authenticate, paymentController.initiateTopUp);

// Payout
router.post('/payout', authenticate, paymentController.initiatePayout);

// Gateway Webhooks (public callback endpoint, cryptographic signature verified)
router.post('/webhook/:gateway', paymentController.handleWebhook);

// Status & Ledger
router.get('/ledger', authenticate, paymentController.getLedger);
router.get('/:id/status', authenticate, paymentController.getStatus);

// Role-Based Workflows
router.post(
  '/order',
  authenticate,
  authorize(['recycling_company']),
  paymentController.processOrderPayment,
);

router.post(
  '/payout/collector',
  authenticate,
  authorize(['admin']),
  paymentController.processCollectorPayout,
);

router.post(
  '/payout/household',
  authenticate,
  authorize(['admin']),
  paymentController.processHouseholdPayout,
);

module.exports = router;

