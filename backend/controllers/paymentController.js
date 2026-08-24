/**
 * Payment controller — mobile banking & payments (FR-10).
 * Owns bKash/Nagad/bank flows, commission, idempotency, webhooks.
 */

/**
 * Placeholder for initiating a payment with auto commission and
 * idempotency key handling (FR-10).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function initiatePayment(req, res) {
  res.status(501).json({ message: 'Payments — not implemented yet (FR-10)' });
}

module.exports = { initiatePayment };
