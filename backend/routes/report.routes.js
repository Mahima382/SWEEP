/**
 * Operational report routes (FR-11 §5). Mounted at /api/admin/reports.
 * All endpoints require an authenticated admin.
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/ReportController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/collection-volume', controller.collectionVolume);
router.get('/revenue', controller.revenue);
router.get('/environmental-impact', controller.environmentalImpact);

module.exports = router;
