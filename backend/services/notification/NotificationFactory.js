const {
  NOTIFICATION_CATEGORIES: CAT,
  NOTIFICATION_PRIORITIES: PRI,
  NOTIFICATION_CHANNELS: CH,
} = require('../../utils/constants/notificationConstants');

/**
 * Data-driven catalogue of every FR-09 notification event. Each rule
 * tells the factory how to turn a raw domain event (published on the
 * event bus) into a concrete notification. Adding a new notification
 * type is a new entry here — nothing else in the pipeline changes
 * (Open/Closed Principle).
 *
 * `mandatory: true` marks notifications that bypass the recipient's
 * channel preferences entirely (Security events, critical account
 * changes, fraud flags) per the FR-09 acceptance criteria.
 */
const NOTIFICATION_RULES = {
  // ---- Household ---------------------------------------------------------
  'pickup.request.accepted': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Your pickup request was accepted',
    body: (d) => `${d.collectorName} accepted your ${d.wasteCategory} pickup request.`,
    dedupeKey: (d) => `pickup.request.accepted:${d.pickupId}`,
  },
  'pickup.collector.assigned': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'A collector has been assigned',
    body: (d) => `${d.collectorName} is on the way for your ${d.wasteCategory} pickup.`,
    dedupeKey: (d) => `pickup.collector.assigned:${d.pickupId}`,
  },
  'pickup.collector.arrived': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH],
    title: () => 'Your collector has arrived',
    body: (d) => `${d.collectorName} has arrived at ${d.pickupAddress}.`,
    dedupeKey: (d) => `pickup.collector.arrived:${d.pickupId}`,
  },
  'pickup.completed': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Pickup completed',
    body: (d) => `Your ${d.wasteCategory} pickup (${d.actualWeight}) is complete.`,
    actions: (d) => [{ label: 'View Pickup', action: 'VIEW_PICKUP', target: d.pickupId }],
    dedupeKey: (d) => `pickup.completed:${d.pickupId}`,
  },
  'pickup.request.autoExpired': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH],
    title: () => 'No collector available yet',
    body: () => "We couldn't find an available collector within 24 hours. Try submitting again, or a different time window.",
    dedupeKey: (d) => `pickup.request.autoExpired:${d.pickupId}`,
  },
  'payment.available': {
    category: CAT.PAYMENT,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Payment available',
    body: (d) => `${d.amount} from your pickup is now available in your wallet.`,
    actions: (d) => [{ label: 'View Wallet', action: 'VIEW_WALLET', target: d.walletId }],
    dedupeKey: (d) => `payment.available:${d.pickupId}`,
  },
  'withdrawal.status.changed': {
    category: CAT.WALLET,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: (d) => `Withdrawal ${d.status.toLowerCase()}`,
    body: (d) => `Your withdrawal of ${d.amount} is now ${d.status.toLowerCase()}.`,
    dedupeKey: (d) => `withdrawal.status.changed:${d.withdrawalId}:${d.status}`,
  },
  'review.reminder': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.IN_APP],
    title: () => "Don't forget to leave a review",
    body: (d) => `How was your pickup with ${d.collectorName}?`,
    dedupeKey: (d) => `review.reminder:${d.pickupId}`,
  },

  // ---- Local collector -----------------------------------------------------
  'pickup.request.new': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH],
    title: () => 'New pickup request in your zone',
    body: (d) => `${d.householdName} · ${d.wasteCategory} · ~${d.estimatedWeight} · ${d.zoneLabel} · ${d.preferredTime}`,
    actions: (d) => [
      { label: 'Accept', action: 'ACCEPT_PICKUP', target: d.pickupId },
      { label: 'Decline', action: 'DECLINE_PICKUP', target: d.pickupId },
    ],
    dedupeKey: (d) => `pickup.request.new:${d.pickupId}:${d.collectorId}`,
  },
  'pickup.upcoming.reminder': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Upcoming pickup reminder',
    body: (d) => `Pickup at ${d.pickupAddress} scheduled for ${d.scheduledTime}.`,
    dedupeKey: (d) => `pickup.upcoming.reminder:${d.pickupId}`,
  },
  'pickup.cancelled': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH],
    title: () => 'Pickup cancelled',
    body: (d) => `The pickup for ${d.householdName} was cancelled.`,
    dedupeKey: (d) => `pickup.cancelled:${d.pickupId}`,
  },
  'pickup.weight.varianceFlagged': {
    category: CAT.PICKUP,
    priority: PRI.URGENT,
    defaultChannels: [CH.PUSH],
    title: () => 'Weight variance flagged',
    body: (d) => `Reported weight for pickup #${d.pickupId} differs from the estimate by ${d.variancePercent}%.`,
    dedupeKey: (d) => `pickup.weight.varianceFlagged:${d.pickupId}`,
  },
  'bulkLot.status.changed': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: (d) => `Bulk lot ${d.status.toLowerCase()}`,
    body: (d) => `Lot #${d.lotId} is now ${d.status.toLowerCase()}.`,
    dedupeKey: (d) => `bulkLot.status.changed:${d.lotId}:${d.status}`,
  },
  'globalCollector.assigned': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Global collector assigned',
    body: (d) => `${d.globalCollectorName} will pick up lot #${d.lotId}.`,
    dedupeKey: (d) => `globalCollector.assigned:${d.lotId}`,
  },

  // ---- Global collector -----------------------------------------------------
  'bulkLot.readyForPickup': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH],
    title: () => 'Bulk lot ready for pickup',
    body: (d) =>
      `${d.localCollectorName} · ${d.lotCategories} · ${d.totalWeight} · ${d.pickupLocation} → ${d.destinationCompany}`,
    actions: (d) => [{ label: 'Track Pickup', action: 'TRACK_PICKUP', target: d.lotId }],
    dedupeKey: (d) => `bulkLot.readyForPickup:${d.lotId}`,
  },
  'bulkLot.assigned': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'New bulk lot assigned to you',
    body: (d) => `Lot #${d.lotId} from ${d.localCollectorName} has been assigned to you.`,
    dedupeKey: (d) => `bulkLot.assigned:${d.lotId}`,
  },
  'pickup.schedule.changed': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Pickup schedule changed',
    body: (d) => `Lot #${d.lotId} rescheduled to ${d.newScheduledTime}.`,
    dedupeKey: (d) => `pickup.schedule.changed:${d.lotId}:${d.newScheduledTime}`,
  },
  'handover.updated': {
    category: CAT.PICKUP,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Handover updated',
    body: (d) => `Handover status for lot #${d.lotId} is now ${d.status}.`,
    dedupeKey: (d) => `handover.updated:${d.lotId}:${d.status}`,
  },
  'delivery.reminder': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Delivery reminder',
    body: (d) => `Delivery to ${d.destinationCompany} scheduled for ${d.scheduledTime}.`,
    dedupeKey: (d) => `delivery.reminder:${d.orderId}`,
  },

  // ---- Recycling company -----------------------------------------------------
  'wasteLot.newRelevant': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'New waste lot matches your profile',
    body: (d) => `Lot #${d.lotId} (${d.category}, ${d.totalWeight}) is available.`,
    dedupeKey: (d) => `wasteLot.newRelevant:${d.lotId}:${d.companyId}`,
  },
  'order.confirmed': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Order confirmed',
    body: (d) => `Your order #${d.orderId} has been confirmed.`,
    actions: (d) => [{ label: 'View Order', action: 'VIEW_ORDER', target: d.orderId }],
    dedupeKey: (d) => `order.confirmed:${d.orderId}`,
  },
  'order.globalCollectorAssigned': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Collector assigned to your order',
    body: (d) => `${d.globalCollectorName} will deliver order #${d.orderId}.`,
    dedupeKey: (d) => `order.globalCollectorAssigned:${d.orderId}`,
  },
  'order.inTransit': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Order in transit',
    body: (d) => `Order #${d.orderId} is on its way.`,
    actions: (d) => [{ label: 'View Order', action: 'VIEW_ORDER', target: d.orderId }],
    dedupeKey: (d) => `order.status:${d.orderId}:IN_TRANSIT`,
  },
  'order.delivered': {
    category: CAT.ORDER,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: () => 'Order delivered',
    body: (d) => `Order #${d.orderId} has been delivered.`,
    actions: (d) => [{ label: 'View Order', action: 'VIEW_ORDER', target: d.orderId }],
    dedupeKey: (d) => `order.status:${d.orderId}:DELIVERED`,
  },
  'payment.status.changed': {
    category: CAT.PAYMENT,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH],
    title: (d) => `Payment ${d.status.toLowerCase()}`,
    body: (d) => `Payment for order #${d.orderId} is now ${d.status.toLowerCase()}.`,
    dedupeKey: (d) => `payment.status.changed:${d.orderId}:${d.status}`,
  },
  'subscription.activated': {
    category: CAT.SUBSCRIPTION,
    priority: PRI.NORMAL,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Subscription activated',
    body: (d) => `Your ${d.planName} subscription is now active.`,
    dedupeKey: (d) => `subscription.activated:${d.subscriptionId}`,
  },
  'subscription.renewal.upcoming': {
    category: CAT.SUBSCRIPTION,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Subscription renewing soon',
    body: (d) => `Your ${d.planName} subscription renews on ${d.renewalDate}.`,
    dedupeKey: (d) => `subscription.renewal.upcoming:${d.subscriptionId}:${d.renewalDate}`,
  },
  'subscription.renewal.failed': {
    category: CAT.SUBSCRIPTION,
    priority: PRI.URGENT,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Subscription renewal failed',
    body: (d) => `We couldn't renew your ${d.planName} subscription. Update your payment method to avoid interruption.`,
    actions: () => [{ label: 'Retry Payment', action: 'RETRY_PAYMENT' }],
    dedupeKey: (d) => `subscription.renewal.failed:${d.subscriptionId}:${d.attemptId}`,
  },
  'subscription.gracePeriod': {
    category: CAT.SUBSCRIPTION,
    priority: PRI.URGENT,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Subscription in grace period',
    body: (d) => `Your subscription is in a grace period until ${d.graceEndsAt}. Renew now to avoid losing access.`,
    actions: () => [{ label: 'Renew Subscription', action: 'RENEW_SUBSCRIPTION' }],
    dedupeKey: (d) => `subscription.gracePeriod:${d.subscriptionId}`,
  },
  'kyc.status.changed': {
    category: CAT.KYC,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: (d) => `KYC ${d.status.toLowerCase()}`,
    body: (d) => `Your KYC/licence status is now ${d.status.toLowerCase()}.`,
    actions: () => [{ label: 'Review KYC', action: 'REVIEW_KYC' }],
    dedupeKey: (d) => `kyc.status.changed:${d.entityId}:${d.status}`,
  },

  // ---- Administrator -----------------------------------------------------
  'kyc.submission.new': {
    category: CAT.KYC,
    priority: PRI.NORMAL,
    defaultChannels: [CH.IN_APP],
    title: () => 'New KYC submission',
    body: (d) => `${d.applicantName} submitted KYC documents for review.`,
    actions: (d) => [{ label: 'Review KYC', action: 'REVIEW_KYC', target: d.submissionId }],
    dedupeKey: (d) => `kyc.submission.new:${d.submissionId}`,
  },
  'fraud.flagged': {
    category: CAT.FRAUD,
    priority: PRI.CRITICAL,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Fraud flag raised',
    body: (d) => `${d.entityType} #${d.entityId} was flagged: ${d.reason}.`,
    dedupeKey: (d) => `fraud.flagged:${d.entityType}:${d.entityId}:${d.flagId}`,
  },
  'weightVariance.significant': {
    category: CAT.FRAUD,
    priority: PRI.URGENT,
    defaultChannels: [CH.PUSH],
    title: () => 'Significant weight variance detected',
    body: (d) => `Pickup #${d.pickupId} shows a ${d.variancePercent}% weight variance.`,
    dedupeKey: (d) => `weightVariance.significant:${d.pickupId}`,
  },
  'account.suspiciousActivity': {
    category: CAT.SECURITY,
    priority: PRI.CRITICAL,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Suspicious account activity',
    body: (d) => `Unusual activity detected on account #${d.accountId}: ${d.reason}.`,
    dedupeKey: (d) => `account.suspiciousActivity:${d.accountId}:${d.eventId}`,
  },
  'payment.failed': {
    category: CAT.PAYMENT,
    priority: PRI.URGENT,
    defaultChannels: [CH.PUSH],
    title: () => 'Payment failure',
    body: (d) => `Payment #${d.paymentId} failed: ${d.reason}.`,
    dedupeKey: (d) => `payment.failed:${d.paymentId}`,
  },
  'payout.failed': {
    category: CAT.PAYMENT,
    priority: PRI.URGENT,
    defaultChannels: [CH.PUSH],
    title: () => 'Payout failure',
    body: (d) => `Payout #${d.payoutId} failed: ${d.reason}.`,
    dedupeKey: (d) => `payout.failed:${d.payoutId}`,
  },
  'subscription.issue': {
    category: CAT.SUBSCRIPTION,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.IN_APP],
    title: () => 'Subscription issue',
    body: (d) => `Subscription #${d.subscriptionId}: ${d.issue}.`,
    dedupeKey: (d) => `subscription.issue:${d.subscriptionId}:${d.issue}`,
  },
  'pickup.delayed': {
    category: CAT.PICKUP,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.IN_APP],
    title: () => 'Pickup delayed',
    body: (d) => `Pickup #${d.pickupId} is delayed: ${d.reason}.`,
    dedupeKey: (d) => `pickup.delayed:${d.pickupId}`,
  },
  'delivery.delayed': {
    category: CAT.ORDER,
    priority: PRI.IMPORTANT,
    defaultChannels: [CH.IN_APP],
    title: () => 'Delivery delayed',
    body: (d) => `Order #${d.orderId} delivery is delayed: ${d.reason}.`,
    dedupeKey: (d) => `delivery.delayed:${d.orderId}`,
  },
  'security.event': {
    category: CAT.SECURITY,
    priority: PRI.CRITICAL,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: () => 'Security event',
    body: (d) => `${d.description}`,
    dedupeKey: (d) => `security.event:${d.eventId}`,
  },
  'audit.loggingFailure': {
    category: CAT.SYSTEM,
    priority: PRI.CRITICAL,
    mandatory: true,
    defaultChannels: [CH.IN_APP],
    title: () => 'Audit logging failure',
    body: (d) => `Audit logging failed for ${d.source}: ${d.reason}.`,
    dedupeKey: (d) => `audit.loggingFailure:${d.source}:${d.timestamp}`,
  },

  // ---- Cross-role ---------------------------------------------------------
  'account.status.changed': {
    category: CAT.ACCOUNT,
    priority: PRI.IMPORTANT,
    mandatory: true,
    defaultChannels: [CH.PUSH, CH.EMAIL],
    title: (d) => `Account ${d.status.toLowerCase()}`,
    body: (d) => `Your account status changed to ${d.status.toLowerCase()}.${d.reason ? ` Reason: ${d.reason}` : ''}`,
    dedupeKey: (d) => `account.status.changed:${d.accountId}:${d.status}`,
  },
  'admin.message': {
    category: CAT.SYSTEM,
    priority: PRI.NORMAL,
    defaultChannels: [CH.IN_APP],
    title: (d) => d.subject || 'Message from the SWEEP team',
    body: (d) => d.message,
    dedupeKey: (d) => `admin.message:${d.messageId}`,
  },
};

class NotificationFactory {
  /**
   * @param {string} event - key into NOTIFICATION_RULES
   * @param {object} data - raw event payload
   * @returns {object} plain notification fields ready for NotificationService
   */
  static create(event, data = {}) {
    const rule = NOTIFICATION_RULES[event];
    if (!rule) {
      throw new Error(`No notification rule registered for event "${event}"`);
    }

    return {
      event,
      category: rule.category,
      priority: rule.priority,
      mandatory: Boolean(rule.mandatory),
      title: rule.title(data),
      body: rule.body(data),
      actions: rule.actions ? rule.actions(data) : [],
      defaultChannels: rule.defaultChannels || [CH.IN_APP],
      dedupeKey: rule.dedupeKey ? rule.dedupeKey(data) : undefined,
      data,
    };
  }

  static hasRule(event) {
    return Object.prototype.hasOwnProperty.call(NOTIFICATION_RULES, event);
  }
}

module.exports = NotificationFactory;
