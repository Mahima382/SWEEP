const eventBus = require('../eventBus');

const FORWARD_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const AUTO_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Owns the two FR-09 timing rules attached to a pickup-request
 * notification:
 *   - forward to the next collector if no response within 30 minutes
 *   - give up and notify the household if no collector responds within 24h
 *
 * This class only manages timers and publishes events on the shared
 * event bus — it deliberately does NOT reassign collectors or mutate
 * pickup state itself. That belongs to the pickup/assignment domain,
 * which is expected to listen for 'pickup.forwardRequested' and
 * 'pickup.autoExpired'. Keeping that logic out of the notification
 * module preserves single responsibility.
 *
 * In production, replace the in-memory timers below with a durable
 * job queue (e.g. Agenda/BullMQ) so pending forwards survive a
 * server restart.
 */
class PickupForwardingScheduler {
  constructor() {
    this._timers = new Map(); // pickupId -> { forward: Timeout, expiry: Timeout }
  }

  /**
   * Call when a pickup request notification is sent to a local
   * collector. Starts (or restarts) the 30-minute no-response timer.
   */
  scheduleForward(pickupId, zoneId, collectorId) {
    this._clear(pickupId, 'forward');

    const forward = setTimeout(() => {
      // Integration point: the pickup/assignment service should listen
      // for this and either forward to the next collector in the zone
      // or, if none remain, call startAutoExpiry(pickupId).
      eventBus.emit('pickup.forwardRequested', { pickupId, zoneId, excludedCollectorId: collectorId });
    }, FORWARD_TIMEOUT_MS);

    this._timers.set(pickupId, { ...(this._timers.get(pickupId) || {}), forward });
  }

  /**
   * Call once when a pickup request first goes out, or when the zone
   * has exhausted every collector without the household cancelling.
   */
  startAutoExpiry(pickupId) {
    this._clear(pickupId, 'expiry');

    const expiry = setTimeout(() => {
      eventBus.emit('pickup.autoExpired', { pickupId });
      this._timers.delete(pickupId);
    }, AUTO_EXPIRY_MS);

    this._timers.set(pickupId, { ...(this._timers.get(pickupId) || {}), expiry });
  }

  /** Call when a collector accepts/declines, or the household cancels. */
  clearAll(pickupId) {
    this._clear(pickupId, 'forward');
    this._clear(pickupId, 'expiry');
    this._timers.delete(pickupId);
  }

  _clear(pickupId, key) {
    const timers = this._timers.get(pickupId);
    if (timers?.[key]) clearTimeout(timers[key]);
  }
}

// Singleton — timers must be shared process-wide, not per-request.
module.exports = new PickupForwardingScheduler();
