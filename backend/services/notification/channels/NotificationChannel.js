/**
 * Strategy interface for a notification delivery channel.
 *
 * Concrete channels (InAppChannel, PushChannel, EmailChannel) implement
 * `send`; NotificationDispatcher (the Strategy "context") only depends on
 * this shape, so a new delivery channel (e.g. SMS) can be added later
 * without touching dispatch logic anywhere else.
 */
class NotificationChannel {
  /**
   * Gets the channel identifier.
   *
   * @returns {string} Channel identifier. Must match NOTIFICATION_CHANNELS.
   */
  get name() {
    throw new Error('NotificationChannel.name must be implemented by a subclass');
  }

  /**
   * Sends a notification through the delivery channel.
   *
   * @param {Object} notification - Saved notification document.
   * @param {Object} recipientUser - Recipient user information.
   * @param {string} recipientUser.id - Recipient user ID.
   * @param {string} [recipientUser.email] - Recipient email address.
   * @returns {Promise<Object>} Delivery result.
   */
  // eslint-disable-next-line no-unused-vars
  async send(notification, recipientUser) {
    throw new Error('NotificationChannel.send must be implemented by a subclass');
  }
}

module.exports = NotificationChannel;