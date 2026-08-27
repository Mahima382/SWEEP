/**
 * Fraud detection routes (FR-11 §3). Mounted at /api/admin/fraud.
 * All endpoints require an authenticated admin.
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/FraudController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/queue', controller.listQueue);
router.get('/rules', controller.listRules);
router.get('/flags/:flagId', controller.getFlag);
router.post('/flags', controller.createFlag);
router.post('/flags/:flagId/clear', controller.clearFlag);
router.post('/flags/:flagId/escalate', controller.escalateFlag);

module.exports = router;
