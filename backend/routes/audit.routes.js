/**
 * Audit log routes (FR-11 §4). Mounted at /api/admin/audit.
 * All endpoints require an authenticated admin.
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/AuditController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', controller.listAuditLogs);
router.get('/export', controller.exportAuditLogs);

module.exports = router;
