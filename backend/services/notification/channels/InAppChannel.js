const NotificationChannel = require('./NotificationChannel');
const socketManager = require('../../socket/socketManager');
const { NOTIFICATION_CHANNELS } = require('../../../utils/constants/notificationConstants');

/**
 * In-app delivery: the notification is already written to the inbox by
 * NotificationService before any channel runs, so this channel's only
 * job is pushing it over the live socket connection (if the user is
 * online) so the UI updates within the ~30s SLA from FR-09. If the user
 * is offline, they'll simply see it next time they open the inbox.
 */
class InAppChannel extends NotificationChannel {
  get name() {
    return NOTIFICATION_CHANNELS.IN_APP;
  }

  async send(notification, recipientUser) {
    socketManager.emitToUser(recipientUser.id, 'notification:new', notification.toJSON());
    // The inbox record already exists — this never "fails" in the way
    // push/email can, it's a best-effort real-time nicety on top of it.
    return { status: 'sent' };
  }
}

module.exports = InAppChannel;
