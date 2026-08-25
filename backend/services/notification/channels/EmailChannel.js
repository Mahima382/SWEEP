const NotificationChannel = require('./NotificationChannel');
const { NOTIFICATION_CHANNELS } = require('../../../utils/constants/notificationConstants');
const emailProvider = require('../../providers/emailProvider');

class EmailChannel extends NotificationChannel {
  get name() {
    return NOTIFICATION_CHANNELS.EMAIL;
  }

  async send(notification, recipientUser) {
    if (!recipientUser.email) return { status: 'failed', error: 'no_email_on_file' };

    try {
      await emailProvider.send({
        to: recipientUser.email,
        subject: notification.title,
        body: notification.body,
      });
      return { status: 'sent' };
    } catch (err) {
      return { status: 'failed', error: err.message };
    }
  }
}

module.exports = EmailChannel;
