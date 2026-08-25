const eventBus = require('../eventBus');
const notificationService = require('./NotificationService');
const NotificationFactory = require('./NotificationFactory');

// Every FR-09 event, grouped by the recipient role that primarily reacts to it.
// This list must stay in sync with the keys in NotificationFactory's rule table.
const HOUSEHOLD_EVENTS = [
  'pickup.request.accepted',
  'pickup.collector.assigned',
  'pickup.collector.arrived',
  'pickup.completed',
  'pickup.request.autoExpired',
  'payment.available',
  'withdrawal.status.changed',
  'review.reminder',
];

const LOCAL_COLLECTOR_EVENTS = [
  'pickup.request.new',
  'pickup.upcoming.reminder',
  'pickup.cancelled',
  'pickup.weight.varianceFlagged',
  'bulkLot.status.changed',
  'globalCollector.assigned',
];

const GLOBAL_COLLECTOR_EVENTS = [
  'bulkLot.readyForPickup',
  'bulkLot.assigned',
  'pickup.schedule.changed',
  'handover.updated',
  'delivery.reminder',
];

const COMPANY_EVENTS = [
  'wasteLot.newRelevant',
  'order.confirmed',
  'order.globalCollectorAssigned',
  'order.inTransit',
  'order.delivered',
  'payment.status.changed',
  'subscription.activated',
  'subscription.renewal.upcoming',
  'subscription.renewal.failed',
  'subscription.gracePeriod',
  'kyc.status.changed',
];

const ADMIN_EVENTS = [
  'kyc.submission.new',
  'fraud.flagged',
  'weightVariance.significant',
  'account.suspiciousActivity',
  'payment.failed',
  'payout.failed',
  'subscription.issue',
  'pickup.delayed',
  'delivery.delayed',
  'security.event',
  'audit.loggingFailure',
];

const CROSS_ROLE_EVENTS = ['account.status.changed', 'admin.message'];

const ALL_EVENTS = [
  ...HOUSEHOLD_EVENTS,
  ...LOCAL_COLLECTOR_EVENTS,
  ...GLOBAL_COLLECTOR_EVENTS,
  ...COMPANY_EVENTS,
  ...ADMIN_EVENTS,
  ...CROSS_ROLE_EVENTS,
];

/**
 * Subscribes every FR-09 domain event to NotificationService.notify().
 * This is the only file that needs to change when a new notification
 * trigger is added elsewhere in the app — the originating module just
 * does `eventBus.emit('some.event', { recipientId, recipientRole, ...data })`
 * and never needs to import anything from the notification module.
 *
 * Call once at startup (see backend/app.js).
 */
function initNotificationEventHandlers() {
  ALL_EVENTS.forEach((event) => {
    if (!NotificationFactory.hasRule(event)) return; // safety net against drift

    eventBus.on(event, (payload = {}) => {
      const { recipientId, recipientRole, ...data } = payload;

      notificationService.notify({ recipientId, recipientRole, event, data }).catch((err) => {
        // Notification failures must never roll back or duplicate the
        // originating business operation (FR-09 edge case).
        // eslint-disable-next-line no-console
        console.error(`[notifications] failed to process "${event}":`, err.message);
      });
    });
  });
}

module.exports = { initNotificationEventHandlers, ALL_EVENTS };
