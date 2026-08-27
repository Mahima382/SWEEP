// backend/controllers/notificationController.js

const Notification = require('../models/Notification');
const {
  emitReadStatus,
  emitAllReadStatus,
} = require('../services/notificationSocket');

const notificationController = {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;

      const limit = Math.min(
        Number(req.query.limit) || 20,
        100,
      );

      const offset = Math.max(
        Number(req.query.offset) || 0,
        0,
      );

      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await Notification.findByUser(userId, {
        limit,
        offset,
        unreadOnly,
      });

      const unreadCount = await Notification.countUnread(userId);

      return res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to load notifications',
      });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const unreadCount = await Notification.countUnread(userId);

      return res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get unread notification count',
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const notificationId = Number(req.params.id);

      if (!Number.isInteger(notificationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID',
        });
      }

      const updated = await Notification.markAsRead(
        notificationId,
        userId,
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or already read',
        });
      }

      emitReadStatus(userId, notificationId);

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
      });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const updated = await Notification.markAllAsRead(userId);

      emitAllReadStatus(userId);

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
      });
    }
  },
};

module.exports = notificationController;