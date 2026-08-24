/**
 * Notification routes (FR-09). Mounted at /api/notifications.
 */

const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', notificationController.getNotifications);

module.exports = router;
