/**
 * Ledger Service (FR-10 — Mobile Banking & Payment).
 *
 * Handles immutable financial transaction ledger records.
 * Enforces strict append-only audit trail and integrity.
 */

class LedgerService {
  /**
   * Records a completed financial transaction into the immutable ledger.
   *
   * @param {object} params - Transaction ledger parameters.
   * @param {string} params.transactionId - Transaction reference.
   * @param {number} params.amount - Gross transaction amount.
   * @param {number} [params.commission=0] - Commission deducted.
   * @param {number} [params.netPayout=amount] - Net payout amount.
   * @param {string} [params.type='general'] - Transaction type.
   * @param {number} [params.userId=null] - User reference.
   * @returns {Promise<object>} Created immutable ledger entry.
   */
  static async recordTransaction({
    transactionId,
    amount,
    commission = 0,
    netPayout = amount,
    type = 'general',
    userId = null,
  }) {
    const entry = {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      transactionId,
      amount,
      commission,
      netPayout,
      type,
      userId,
      status: 'Completed',
      timestamp: new Date(),
    };

    this.ledgerEntries.push(entry);
    return entry;
  }

  /**
   * Prohibits modification of ledger entries.
   *
   * @throws {Error} Modification is strictly prohibited.
   */
  static async updateEntry() {
    throw new Error('Ledger entries are immutable. Modification not permitted.');
  }

  /**
   * Prohibits deletion of ledger entries.
   *
   * @throws {Error} Deletion is strictly prohibited.
   */
  static async deleteEntry() {
    throw new Error('Ledger entries cannot be deleted. Deletion not permitted.');
  }

  /**
   * Evaluates payment result and creates ledger entry only for non-failed transactions.
   *
   * @param {object} payment - Payment result.
   * @returns {Promise<object>} Outcome indicator.
   */
  static async handlePaymentResult(payment) {
    if (payment.status === 'Failed') {
      return {
        ledgerCreated: false,
        reason: payment.failureReason || 'Payment failed',
      };
    }

    const entry = await this.recordTransaction({
      transactionId: payment.transactionId,
      amount: payment.amount,
      commission: payment.commission || 0,
      netPayout: payment.netPayout || payment.amount,
      userId: payment.userId,
    });

    return {
      ledgerCreated: true,
      entry,
    };
  }

  /**
   * Finds ledger entries by transaction ID.
   *
   * @param {string} transactionId - Transaction ID.
   * @returns {Promise<object[]>} Matching ledger entries.
   */
  static async findByTransactionId(transactionId) {
    return this.ledgerEntries.filter((e) => e.transactionId === transactionId);
  }

  /**
   * Finds ledger entries for a specific user.
   *
   * @param {number} userId - User ID.
   * @returns {Promise<object[]>} User's ledger entries.
   */
  static async findByUserId(userId) {
    return this.ledgerEntries.filter((e) => e.userId === userId);
  }
}

LedgerService.ledgerEntries = [];

module.exports = LedgerService;
