/**
 * Payment routes (FR-10). Mounted at /api/payments.
 */

const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/', paymentController.initiatePayment);

module.exports = router;
