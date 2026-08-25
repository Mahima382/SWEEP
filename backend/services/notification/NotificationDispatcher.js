const InAppChannel = require('./channels/InAppChannel');
const PushChannel = require('./channels/PushChannel');
const EmailChannel = require('./channels/EmailChannel');
const { NOTIFICATION_CHANNELS } = require('../../utils/constants/notificationConstants');

const RETRY_DELAYS_MS = [5000, 30000, 120000]; // 5s, 30s, 2min backoff

/**
 * Strategy "context": picks the right channel implementation and runs
 * delivery, retrying transient PUSH/EMAIL failures a few times before
 * giving up (the in-app inbox record is unaffected either way — FR-09
 * requires that a failed push/email never removes or blocks the in-app
 * copy). In production, swap the setTimeout backoff below for a real
 * job queue (BullMQ/Agenda) so retries survive a server restart.
 */
class NotificationDispatcher {
  constructor() {
    this.channels = {
      [NOTIFICATION_CHANNELS.IN_APP]: new InAppChannel(),
      [NOTIFICATION_CHANNELS.PUSH]: new PushChannel(),
      [NOTIFICATION_CHANNELS.EMAIL]: new EmailChannel(),
    };
  }

  /**
   * @param {import('../../models/Notification')} notification - saved document
   * @param {{ id: string, email?: string }} recipientUser
   * @param {string[]} channelNames
   */
  async dispatch(notification, recipientUser, channelNames) {
    const uniqueChannels = [...new Set([NOTIFICATION_CHANNELS.IN_APP, ...channelNames])];

    await Promise.all(
      uniqueChannels.map((name) => this._deliverWithRetry(notification, recipientUser, name))
    );

    await notification.save();
    return notification;
  }

  async _deliverWithRetry(notification, recipientUser, channelName, attempt = 0) {
    const channel = this.channels[channelName];
    if (!channel) return;

    let entry = notification.deliveryStatus.find((d) => d.channel === channelName);
    if (!entry) {
      entry = { channel: channelName, status: 'pending', attempts: 0 };
      notification.deliveryStatus.push(entry);
    }

    entry.attempts += 1;
    entry.lastAttemptAt = new Date();

    try {
      const result = await channel.send(notification, recipientUser);
      entry.status = result.status;
      entry.error = result.error;

      const canRetry = result.status === 'failed' && channelName !== NOTIFICATION_CHANNELS.IN_APP;
      if (canRetry && attempt < RETRY_DELAYS_MS.length) {
        setTimeout(() => {
          this._deliverWithRetry(notification, recipientUser, channelName, attempt + 1).then(() =>
            notification.save()
          );
        }, RETRY_DELAYS_MS[attempt]);
      }
    } catch (err) {
      entry.status = 'failed';
      entry.error = err.message;
    }
  }
}

// Stateless aside from the fixed channel map, so a single shared
// instance is safe and avoids re-instantiating channels per call.
module.exports = new NotificationDispatcher();
