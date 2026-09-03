/**
 * Wallet controller — household earnings, withdrawal, and export (FR-04).
 */

const walletModel = require('../models/walletModel');
const { buildWalletCsv, buildWalletPdf } = require('../src/walletExport');

/**
 * Household id for this request. Auth (FR-02) can attach req.user later.
 * @param {object} req Express request.
 * @returns {string} Wallet owner id.
 */
function ownerId(req) {
  if (req.user && req.user.id) {
    return String(req.user.id);
  }
  return walletModel.DEFAULT_HOUSEHOLD_ID;
}

/**
 * Send a domain error with its HTTP status, or forward unexpected errors.
 * @param {Error} err Domain or system error.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function sendError(err, res, next) {
  if (err && err.status) {
    const body = { message: err.message };
    if (err.errors) {
      body.errors = err.errors;
    }
    res.status(err.status).json(body);
    return;
  }
  next(err);
}

/**
 * GET /api/wallet — pending vs available balances and history.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function getWallet(req, res, next) {
  try {
    res.status(200).json(walletModel.getWallet(ownerId(req)));
  } catch (err) {
    sendError(err, res, next);
  }
}

/**
 * POST /api/wallet/withdraw — pay out available funds.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function withdrawFunds(req, res, next) {
  try {
    const wallet = walletModel.withdraw(ownerId(req), req.body || {});
    res.status(200).json(wallet);
  } catch (err) {
    sendError(err, res, next);
  }
}

/**
 * GET /api/wallet/export/csv — download the ledger as CSV.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function exportCsv(req, res, next) {
  try {
    const wallet = walletModel.getWallet(ownerId(req));
    const csv = buildWalletCsv(wallet.transactions, wallet);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sweep-wallet.csv"',
    );
    res.status(200).send(csv);
  } catch (err) {
    sendError(err, res, next);
  }
}

/**
 * GET /api/wallet/export/pdf — download the ledger as PDF.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function exportPdf(req, res, next) {
  try {
    const wallet = walletModel.getWallet(ownerId(req));
    const pdf = buildWalletPdf(wallet.transactions, wallet);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sweep-wallet.pdf"',
    );
    res.status(200).send(Buffer.from(pdf, 'ascii'));
  } catch (err) {
    sendError(err, res, next);
  }
}

module.exports = {
  getWallet,
  withdrawFunds,
  exportCsv,
  exportPdf,
};
