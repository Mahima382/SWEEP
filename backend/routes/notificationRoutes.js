// backend/routes/notificationRoutes.js

const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/*
 * Replace this import with the authentication
 * middleware already used by your project.
 */
const authMiddleware = require('../middleware/auth');

router.get(
  '/',
  authMiddleware,
  notificationController.getNotifications,
);

router.get(
  '/unread-count',
  authMiddleware,
  notificationController.getUnreadCount,
);

router.patch(
  '/:id/read',
  authMiddleware,
  notificationController.markAsRead,
);

router.patch(
  '/read-all',
  authMiddleware,
  notificationController.markAllAsRead,
);

module.exports = router;