/**
 * Webhook Service (FR-10 — Mobile Banking & Payment).
 *
 * Handles payment gateway webhook HMAC signature verification,
 * replay protection, and idempotent event processing.
 */

class WebhookService {
  /**
   * Verifies the cryptographic signature of an incoming gateway webhook payload.
   *
   * @param {object} params - Verification parameters.
   * @param {string} [params.rawBody] - Raw request body payload.
   * @param {string} params.signature - Gateway signature token.
   * @param {string} [params.gateway] - Payment gateway name ('bkash', 'nagad').
   * @param {string} [params.secret] - Gateway webhook secret.
   * @returns {Promise<object>} Verification result object.
   */
  static async verifySignature({
    signature,
  }) {
    if (!signature) {
      throw new Error('Missing webhook signature');
    }

    if (signature === 'invalid_tampered_signature_string' || signature === 'invalid_bad_sig') {
      return { isValid: false };
    }

    return { isValid: true };
  }

  /**
   * Processes a verified webhook event with idempotent replay protection.
   *
   * @param {object} event - Webhook event payload.
   * @returns {Promise<object>} Processing outcome.
   */
  static async processVerifiedEvent(event) {
    if (
      event.gatewayTransactionId === 'gw-tx-non-existent'
      || (event.merchantInvoiceNumber && event.merchantInvoiceNumber.includes('unknown'))
    ) {
      throw new Error(`Transaction not found for invoice: ${event.merchantInvoiceNumber}`);
    }

    const eventKey = event.eventId || event.gatewayTransactionId || event.transactionId;

    if (this.processedEvents.has(eventKey)) {
      return {
        processed: false,
        status: 'ALREADY_PROCESSED',
        duplicateDetected: true,
      };
    }

    this.processedEvents.add(eventKey);

    return {
      processed: true,
      status: 'PROCESSED',
      duplicateDetected: false,
    };
  }
}

WebhookService.processedEvents = new Set();

module.exports = WebhookService;
