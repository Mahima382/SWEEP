// backend/services/notificationService.js

const Notification = require('../models/Notification');
const {
  emitToUser,
} = require('./notificationSocket');

const notificationService = {
  async create({
    recipientId,
    type,
    priority = 'Normal',
    title,
    message,
    referenceType = null,
    referenceId = null,
    actionType = null,
    actionUrl = null,
  }) {
    const notification = await Notification.create({
      recipientId,
      type,
      priority,
      title,
      message,
      referenceType,
      referenceId,
      actionType,
      actionUrl,
    });

    emitToUser(recipientId, notification);

    return notification;
  },

  async pickup({
    recipientId,
    title,
    message,
    pickupId,
    priority = 'Important',
    actionType = 'View Pickup',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Pickup',
      priority,
      title,
      message,
      referenceType: 'pickup',
      referenceId: pickupId,
      actionType,
      actionUrl,
    });
  },

  async order({
    recipientId,
    title,
    message,
    orderId,
    priority = 'Important',
    actionType = 'View Order',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Order',
      priority,
      title,
      message,
      referenceType: 'order',
      referenceId: orderId,
      actionType,
      actionUrl,
    });
  },

  async payment({
    recipientId,
    title,
    message,
    transactionId,
    priority = 'Important',
    actionType = 'View Wallet',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Payment',
      priority,
      title,
      message,
      referenceType: 'transaction',
      referenceId: transactionId,
      actionType,
      actionUrl,
    });
  },

  async wallet({
    recipientId,
    title,
    message,
    transactionId,
    priority = 'Important',
    actionType = 'View Wallet',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Wallet',
      priority,
      title,
      message,
      referenceType: 'transaction',
      referenceId: transactionId,
      actionType,
      actionUrl,
    });
  },

  async subscription({
    recipientId,
    title,
    message,
    subscriptionId,
    priority = 'Important',
    actionType = 'View Subscription',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Subscription',
      priority,
      title,
      message,
      referenceType: 'subscription',
      referenceId: subscriptionId,
      actionType,
      actionUrl,
    });
  },

  async kyc({
    recipientId,
    title,
    message,
    kycId,
    priority = 'Important',
    actionType = 'Review KYC',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'KYC',
      priority,
      title,
      message,
      referenceType: 'kyc',
      referenceId: kycId,
      actionType,
      actionUrl,
    });
  },

  async security({
    recipientId,
    title,
    message,
    referenceId = null,
    priority = 'Critical',
    actionType = null,
    actionUrl = null,
  }) {
    return this.create({
      recipientId,
      type: 'Security',
      priority,
      title,
      message,
      referenceType: 'security',
      referenceId,
      actionType,
      actionUrl,
    });
  },

  async fraud({
    recipientId,
    title,
    message,
    fraudId,
    priority = 'Urgent',
    actionType = 'Review Fraud',
    actionUrl,
  }) {
    return this.create({
      recipientId,
      type: 'Fraud',
      priority,
      title,
      message,
      referenceType: 'fraud',
      referenceId: fraudId,
      actionType,
      actionUrl,
    });
  },

  async account({
    recipientId,
    title,
    message,
    priority = 'Important',
    actionType = null,
    actionUrl = null,
  }) {
    return this.create({
      recipientId,
      type: 'Account',
      priority,
      title,
      message,
      actionType,
      actionUrl,
    });
  },

  async system({
    recipientId,
    title,
    message,
    priority = 'Normal',
    actionType = null,
    actionUrl = null,
  }) {
    return this.create({
      recipientId,
      type: 'System',
      priority,
      title,
      message,
      actionType,
      actionUrl,
    });
  },
};

module.exports = notificationService;