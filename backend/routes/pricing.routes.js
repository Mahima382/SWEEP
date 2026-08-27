/**
 * Pricing & commission routes (FR-11 §1). Mounted at /api/admin/pricing.
 * All endpoints require an authenticated admin.
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/PricingController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.post('/price', controller.createPriceVersion);
router.get('/price', controller.listPriceVersions);
router.post('/commission', controller.createCommissionVersion);
router.get('/commission', controller.listCommissionVersions);

module.exports = router;
