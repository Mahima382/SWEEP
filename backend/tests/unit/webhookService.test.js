/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Unit tests for WebhookService (FR-10 — Mobile Banking & Payment).
 *
 * Strict TDD RED Phase: Tests cryptographic signature verification & webhook idempotency.
 * Covers:
 * - Test Group 8: Webhook Security (Criteria 41-45)
 */

let webhookService;
try {
  // eslint-disable-next-line global-require
  webhookService = require('../../services/webhookService');
} catch (e) {
  webhookService = {};
}

describe('WebhookService (FR-10 Unit Tests)', () => {
  describe('TEST GROUP 8 — Webhook Cryptographic Verification & Replay Protection', () => {
    const rawPayload = JSON.stringify({
      gatewayTransactionId: 'bkash-tx-777888',
      merchantInvoiceNumber: 'inv-sweep-1001',
      amount: '750.00',
      currency: 'BDT',
      status: 'Completed',
    });

    const mockSecret = 'secret_webhook_key_2026';

    it('41. A valid gateway webhook signature is accepted', async () => {
      // In a HMAC-SHA256 scheme, valid signature matches payload hash
      const validSignature = 'valid_hmac_signature_token';

      const verification = await webhookService.verifySignature({
        rawBody: rawPayload,
        signature: validSignature,
        gateway: 'bkash',
        secret: mockSecret,
      });

      expect(verification.isValid).toBe(true);
    });

    it('42. An invalid webhook signature is rejected', async () => {
      const tamperedSignature = 'invalid_tampered_signature_string';

      const verification = await webhookService.verifySignature({
        rawBody: rawPayload,
        signature: tamperedSignature,
        gateway: 'bkash',
        secret: mockSecret,
      });

      expect(verification.isValid).toBe(false);
    });

    it('43. A missing webhook signature is rejected', async () => {
      await expect(
        webhookService.verifySignature({
          rawBody: rawPayload,
          signature: null,
          gateway: 'bkash',
          secret: mockSecret,
        }),
      ).rejects.toThrow(/missing webhook signature/i);

      await expect(
        webhookService.verifySignature({
          rawBody: rawPayload,
          signature: undefined,
          gateway: 'nagad',
          secret: mockSecret,
        }),
      ).rejects.toThrow(/missing webhook signature/i);
    });

    it('44. A duplicate valid webhook does not process the transaction twice', async () => {
      const validWebhookEvent = {
        eventId: 'evt-webhook-001',
        gatewayTransactionId: 'gw-tx-999000',
        merchantInvoiceNumber: 'inv-sweep-1002',
        amount: 1500,
        status: 'Completed',
      };

      const firstProcess = await webhookService.processVerifiedEvent(validWebhookEvent);
      const secondProcess = await webhookService.processVerifiedEvent(validWebhookEvent);

      expect(firstProcess.processed).toBe(true);
      expect(firstProcess.status).toBe('PROCESSED');
      expect(secondProcess.processed).toBe(false);
      expect(secondProcess.status).toBe('ALREADY_PROCESSED');
      expect(secondProcess.duplicateDetected).toBe(true);
    });

    it('45. A webhook for an unknown transaction is rejected safely', async () => {
      const unknownTransactionEvent = {
        eventId: 'evt-webhook-unknown',
        gatewayTransactionId: 'gw-tx-non-existent',
        merchantInvoiceNumber: 'inv-unknown-999999',
        amount: 2000,
        status: 'Completed',
      };

      await expect(
        webhookService.processVerifiedEvent(unknownTransactionEvent),
      ).rejects.toThrow(/transaction not found|unknown transaction/i);
    });
  });
});
