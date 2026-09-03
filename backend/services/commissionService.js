/**
 * Commission Service (FR-10 — Mobile Banking & Payment).
 *
 * Handles commission calculations, rate configurations, dynamic updates,
 * and immutable historical rate snapshots.
 */

const DEFAULT_TRANSACTION_RATES = {
  waste_lot_order: 0.07,
  household_pickup: 0.03,
  subscription: 0.0,
};

const DEFAULT_CATEGORY_RATES = {
  Plastic: 0.05,
  Paper: 0.03,
  Metal: 0.04,
  Glass: 0.03,
  'E-waste': 0.10,
  Organic: 0.02,
  Textile: 0.04,
  Mixed: 0.05,
};

class CommissionService {
  /**
   * Calculates commission and net amount for a given gross amount and rate.
   *
   * @param {object} params - Calculation parameters.
   * @param {number} params.amount - Gross transaction amount.
   * @param {number} params.rate - Commission rate (decimal, e.g., 0.05 for 5%).
   * @returns {Promise<object>} Calculation breakdown.
   */
  static async calculateCommission({ amount, rate }) {
    const commissionAmount = Math.round(amount * rate * 100) / 100;
    const netAmount = Math.round((amount - commissionAmount) * 100) / 100;

    return {
      grossAmount: amount,
      commissionRate: rate,
      commissionAmount,
      netAmount,
    };
  }

  /**
   * Deducts commission before payout execution.
   *
   * @param {object} params - Payout deduction parameters.
   * @param {number} params.grossAmount - Gross payout amount.
   * @param {number} params.rate - Commission rate.
   * @returns {Promise<object>} Net payout and deducted commission.
   */
  static async deductCommissionForPayout({ grossAmount, rate }) {
    const deductedCommission = Math.round(grossAmount * rate * 100) / 100;
    const netPayout = Math.round((grossAmount - deductedCommission) * 100) / 100;

    return {
      deductedCommission,
      netPayout,
    };
  }

  /**
   * Retrieves commission rate for a specific transaction type.
   *
   * @param {string} transactionType - Transaction type (e.g. 'waste_lot_order').
   * @returns {Promise<number>} Commission rate.
   */
  static async getRateForTransactionType(transactionType) {
    return this.transactionRates[transactionType] !== undefined
      ? this.transactionRates[transactionType]
      : 0.05;
  }

  /**
   * Retrieves commission rate for a specific waste category.
   *
   * @param {string} category - Waste category (e.g. 'Plastic', 'E-waste').
   * @returns {Promise<number>} Commission rate.
   */
  static async getRateForCategory(category) {
    return this.categoryRates[category] !== undefined
      ? this.categoryRates[category]
      : 0.05;
  }

  /**
   * Calculates commission for a specific waste category and gross amount.
   *
   * @param {object} params - Category calculation parameters.
   * @param {string} params.category - Waste category.
   * @param {number} params.amount - Gross transaction amount.
   * @returns {Promise<object>} Breakdown with category rate applied.
   */
  static async calculateForCategory({ category, amount }) {
    const rate = await this.getRateForCategory(category);
    return this.calculateCommission({ amount, rate });
  }

  /**
   * Updates commission rate for a waste category (affects new transactions only).
   *
   * @param {string} category - Waste category.
   * @param {number} newRate - New commission rate.
   * @returns {Promise<void>}
   */
  static async updateCategoryRate(category, newRate) {
    this.categoryRates[category] = newRate;
  }

  /**
   * Retrieves immutable commission snapshot for a historical transaction.
   *
   * @param {string} transactionId - Transaction ID.
   * @param {object} historicalTx - Historical transaction record.
   * @returns {Promise<object>} Historical commission snapshot.
   */
  static async getTransactionCommissionSnapshot(transactionId, historicalTx) {
    return {
      transactionId,
      commissionRate: historicalTx.commissionRate,
      commissionAmount: historicalTx.commissionAmount,
      netAmount: historicalTx.netAmount,
    };
  }

  /**
   * Formats commission details for inclusion in ledger/transaction records.
   *
   * @param {object} params - Transaction parameters.
   * @returns {Promise<object>} Formatted ledger commission details.
   */
  static async formatLedgerCommissionDetails({
    amount,
    rate,
    transactionType,
    category,
  }) {
    const { commissionAmount, netAmount } = await this.calculateCommission({
      amount,
      rate,
    });

    return {
      grossAmount: amount,
      commissionRate: rate,
      commissionAmount,
      netPayout: netAmount,
      transactionType,
      category,
    };
  }
}

CommissionService.categoryRates = { ...DEFAULT_CATEGORY_RATES };
CommissionService.transactionRates = { ...DEFAULT_TRANSACTION_RATES };

module.exports = CommissionService;
