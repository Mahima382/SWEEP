const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CHANNELS,
} = require('../utils/constants/notificationConstants');

const actionSchema = new Schema(
  {
    label: { type: String, required: true },
    action: { type: String, required: true }, // e.g. 'ACCEPT_PICKUP', 'VIEW_ORDER'
    target: { type: Schema.Types.Mixed }, // usually the related entity's id
  },
  { _id: false }
);

const deliveryStatusSchema = new Schema(
  {
    channel: { type: String, enum: Object.values(NOTIFICATION_CHANNELS), required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    error: { type: String },
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: { type: String, required: true },

    // The domain event that produced this notification, e.g. 'pickup.request.new'.
    event: { type: String, required: true },

    category: { type: String, enum: Object.values(NOTIFICATION_CATEGORIES), required: true },
    priority: {
      type: String,
      enum: Object.values(NOTIFICATION_PRIORITIES),
      default: NOTIFICATION_PRIORITIES.NORMAL,
    },

    // Mandatory notifications ignore the recipient's channel preferences
    // (e.g. SECURITY events, critical account changes) per FR-09.
    mandatory: { type: Boolean, default: false },

    title: { type: String, required: true },
    body: { type: String, required: true },

    // Free-form contextual payload (pickupId, orderId, zoneLabel, etc.)
    // used to render the notification and to resolve contextual actions.
    data: { type: Schema.Types.Mixed, default: {} },

    actions: { type: [actionSchema], default: [] },
    deliveryStatus: { type: [deliveryStatusSchema], default: [] },

    // Used to make notification creation idempotent for a given
    // recipient — the same domain event fired twice must not create
    // two inbox entries.
    dedupeKey: { type: String, index: true },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, dedupeKey: 1 }, { unique: true, sparse: true });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

notificationSchema.methods.markAsRead = function markAsRead() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
  return this;
};

notificationSchema.statics.getUnreadCount = function getUnreadCount(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
