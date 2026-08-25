/**
 * Strategy interface for a notification delivery channel.
 *
 * Concrete channels (InAppChannel, PushChannel, EmailChannel) implement
 * `send`; NotificationDispatcher (the Strategy "context") only depends on
 * this shape, so a new delivery channel (e.g. SMS) can be added later
 * without touching dispatch logic anywhere else.
 */
class NotificationChannel {
  /** @returns {string} channel identifier — must match NOTIFICATION_CHANNELS */
  get name() {
    throw new Error('NotificationChannel.name must be implemented by a subclass');
  }

  /**
   * @param {import('../../../models/Notification')} notification - saved notification document
   * @param {{ id: string, email?: string }} recipientUser
   * @returns {Promise<{ status: 'sent' | 'failed', error?: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async send(notification, recipientUser) {
    throw new Error('NotificationChannel.send must be implemented by a subclass');
  }
}

module.exports = NotificationChannel;
