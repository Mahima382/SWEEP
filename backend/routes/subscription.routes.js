/**
 * Subscription management routes (FR-11 §2). Mounted at /api/admin/subscriptions.
 * All endpoints require an authenticated admin.
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/SubscriptionController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.post('/plans', controller.createPlan);
router.get('/plans', controller.listPlans);
router.put('/plans/:planId', controller.updatePlan);
router.post('/plans/:planId/archive', controller.archivePlan);

module.exports = router;
