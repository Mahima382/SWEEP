const EventEmitter = require('events');

/**
 * Application-wide event bus (Observer pattern).
 *
 * Domain modules (pickup, payment, KYC, subscriptions, wallet, etc.)
 * publish plain events here — e.g. `eventBus.emit('pickup.completed', {...})`
 * — and the notification module subscribes in notificationEventHandlers.js.
 * Neither side imports the other, so the notification system can be
 * extended (or entirely swapped out) without touching every controller
 * that currently triggers a notification.
 */
class AppEventBus extends EventEmitter {}

// Singleton instance shared across the whole backend process.
module.exports = new AppEventBus();
