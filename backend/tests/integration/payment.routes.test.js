/**
 * Integration tests for Payment Routes (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests REST API endpoints using Supertest against the Express app.
 * Covers:
 * - Top-Up API Endpoints
 * - Payout API Endpoints & Thresholds
 * - Gateway Webhook Callbacks & Security
 * - Status Tracking & Ledger Endpoints
 * - Role-Based Workflow API Endpoints
 * - Auth & RBAC Protections
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Helper to generate JWT token for test requests.
 *
 * @param {object} payload - Token payload (e.g. { id, role }).
 * @returns {string} Signed JWT Bearer token.
 */
function generateTestToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Payment API Routes (FR-10 Integration Tests)', () => {
  const householdToken = generateTestToken({ id: 101, role: 'household' });
  const collectorToken = generateTestToken({ id: 201, role: 'local_collector' });
  const companyToken = generateTestToken({ id: 301, role: 'recycling_company' });
  const adminToken = generateTestToken({ id: 1, role: 'admin' });

  describe('Authentication & RBAC', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/v1/payments/topup')
        .send({ amount: 500 });

      expect(res.status).toBe(401);
    });

    it('returns 403 when role is not authorized for the endpoint', async () => {
      const res = await request(app)
        .post('/api/v1/payments/order')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({ orderId: 'lot-order-1', amount: 5000 });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/payments/topup', () => {
    it('creates a new top-up payment with status Initiated', async () => {
      const res = await request(app)
        .post('/api/v1/payments/topup')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: 500,
          channel: 'bkash',
          idempotencyKey: 'api-topup-key-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
      expect(res.body.data.amount).toBe(500);
      expect(res.body.data.channel).toBe('bkash');
    });

    it('rejects duplicate top-up request with same idempotency key', async () => {
      const payload = {
        amount: 500,
        channel: 'bkash',
        idempotencyKey: 'api-topup-duplicate-key',
      };

      await request(app)
        .post('/api/v1/payments/topup')
        .set('Authorization', `Bearer ${householdToken}`)
        .send(payload);

      const duplicateRes = await request(app)
        .post('/api/v1/payments/topup')
        .set('Authorization', `Bearer ${householdToken}`)
        .send(payload);

      expect([409, 400]).toContain(duplicateRes.status);
      expect(duplicateRes.body.success).toBe(false);
    });

    it('rejects top-up with invalid or missing amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments/topup')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: -50,
          channel: 'bkash',
          idempotencyKey: 'api-topup-invalid-amount',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/payments/payout', () => {
    it('initiates payout when amount meets minimum threshold with verified account', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: 500,
          channel: 'bkash',
          accountNumber: '01711223344',
          idempotencyKey: 'api-payout-key-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
      expect(res.body.data.amount).toBe(500);
    });

    it('rejects payout when amount is below minimum threshold and returns the threshold', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: 20, // Below min threshold (e.g. 100)
          channel: 'bkash',
          accountNumber: '01711223344',
          idempotencyKey: 'api-payout-below-min',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/minimum threshold/i);
      expect(res.body.minThreshold).toBeDefined();
    });

    it('rejects payout when account is unverified', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: 300,
          channel: 'bkash',
          accountNumber: '01999999999',
          isVerified: false,
          idempotencyKey: 'api-payout-unverified',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/verified/i);
    });

    it('rejects payout with unsupported payment channel', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout')
        .set('Authorization', `Bearer ${householdToken}`)
        .send({
          amount: 300,
          channel: 'unsupported_channel',
          idempotencyKey: 'api-payout-unsupported',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('allows verified collector to initiate payout to mobile banking account', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout')
        .set('Authorization', `Bearer ${collectorToken}`)
        .send({
          amount: 1500,
          channel: 'bkash',
          accountNumber: '01711223344',
          idempotencyKey: 'api-collector-payout-key',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
    });
  });

  describe('POST /api/v1/payments/webhook/:gateway', () => {
    it('accepts valid gateway webhook signature and returns 200', async () => {
      const webhookPayload = {
        transactionId: 'bkash-hook-001',
        merchantInvoiceNumber: 'inv-101',
        amount: '500.00',
        status: 'Completed',
      };

      const res = await request(app)
        .post('/api/v1/payments/webhook/bkash')
        .set('X-Gateway-Signature', 'valid_signature_token')
        .send(webhookPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects webhook with missing or invalid signature', async () => {
      const resMissing = await request(app)
        .post('/api/v1/payments/webhook/bkash')
        .send({ transactionId: 'bkash-hook-002' });

      expect([400, 401]).toContain(resMissing.status);

      const resInvalid = await request(app)
        .post('/api/v1/payments/webhook/bkash')
        .set('X-Gateway-Signature', 'invalid_bad_sig')
        .send({ transactionId: 'bkash-hook-002' });

      expect([400, 401]).toContain(resInvalid.status);
    });

    it('handles duplicate webhook callback idempotently', async () => {
      const webhookPayload = {
        transactionId: 'bkash-hook-duplicate-001',
        merchantInvoiceNumber: 'inv-102',
        amount: '500.00',
        status: 'Completed',
      };

      const firstRes = await request(app)
        .post('/api/v1/payments/webhook/bkash')
        .set('X-Gateway-Signature', 'valid_signature_token')
        .send(webhookPayload);

      const secondRes = await request(app)
        .post('/api/v1/payments/webhook/bkash')
        .set('X-Gateway-Signature', 'valid_signature_token')
        .send(webhookPayload);

      expect(firstRes.status).toBe(200);
      expect(secondRes.status).toBe(200);
      expect(secondRes.body.duplicateHandled).toBe(true);
    });
  });

  describe('GET /api/v1/payments/:id/status', () => {
    it('returns tracking status for a valid payment ID', async () => {
      const res = await request(app)
        .get('/api/v1/payments/pay-track-123/status')
        .set('Authorization', `Bearer ${householdToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
    });
  });

  describe('GET /api/v1/payments/ledger', () => {
    it('returns immutable transaction ledger records for user', async () => {
      const res = await request(app)
        .get('/api/v1/payments/ledger')
        .set('Authorization', `Bearer ${householdToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Role-Based Workflow Endpoints', () => {
    it('POST /api/v1/payments/order — allows recycling company to pay for waste lot order (Flow A)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/order')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          orderId: 'waste-order-88',
          wasteLotId: 'bulk-lot-77',
          amount: 45000,
          channel: 'bank_account',
          idempotencyKey: 'api-order-pay-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
    });

    it('POST /api/v1/payments/payout/collector — platform pays local collector after handover confirmed (Flow B)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout/collector')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          collectorId: 201,
          lotId: 'bulk-lot-77',
          amount: 8000,
          handoverConfirmed: true,
          idempotencyKey: 'api-col-payout-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
    });

    it('POST /api/v1/payments/payout/household — platform pays household after pickup confirmed (Flow C)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/payout/household')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          householdId: 101,
          pickupId: 'pickup-99',
          amount: 1200,
          pickupConfirmed: true,
          idempotencyKey: 'api-hh-payout-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Initiated');
    });
  });
});
