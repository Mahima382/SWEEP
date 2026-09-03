/**
 * Review controller — per-transaction reviews (FR-04).
 */

const walletModel = require('../models/walletModel');

/**
 * Household id for this request.
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
 * GET /api/reviews — list reviews, optionally filtered by transactionId.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function getReviews(req, res, next) {
  try {
    const transactionId = req.query && req.query.transactionId;
    res.status(200).json({
      reviews: walletModel.getReviews(ownerId(req), transactionId),
    });
  } catch (err) {
    sendError(err, res, next);
  }
}

/**
 * POST /api/reviews — rate a confirmed pickup earning.
 * Body: { transactionId, rating, comment }.
 * @param {object} req Express request.
 * @param {object} res Express response.
 * @param {Function} next Express next.
 * @returns {void}
 */
function createReview(req, res, next) {
  try {
    const body = req.body || {};
    if (!body.transactionId) {
      res.status(400).json({
        message: 'transactionId is required.',
        errors: { transactionId: 'transactionId is required.' },
      });
      return;
    }
    const wallet = walletModel.saveReview(ownerId(req), body.transactionId, {
      rating: body.rating,
      comment: body.comment,
    });
    res.status(200).json(wallet);
  } catch (err) {
    sendError(err, res, next);
  }
}

module.exports = { getReviews, createReview };
