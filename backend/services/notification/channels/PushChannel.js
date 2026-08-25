const NotificationChannel = require('./NotificationChannel');
const PushToken = require('../../../models/PushToken');
const { NOTIFICATION_CHANNELS } = require('../../../utils/constants/notificationConstants');
const pushProvider = require('../../providers/pushProvider');

/**
 * Push delivery via FCM/APNs, behind the `pushProvider` adapter so the
 * real SDK can be plugged in without touching this class.
 */
class PushChannel extends NotificationChannel {
  get name() {
    return NOTIFICATION_CHANNELS.PUSH;
  }

  async send(notification, recipientUser) {
    const tokens = await PushToken.find({ user: recipientUser.id, isValid: true });
    if (tokens.length === 0) return { status: 'failed', error: 'no_registered_device' };

    const results = await Promise.allSettled(
      tokens.map((t) =>
        pushProvider.sendToToken(t.token, {
          title: notification.title,
          body: notification.body,
          data: { notificationId: String(notification._id), ...notification.data },
        })
      )
    );

    results.forEach((result, i) => {
      if (result.status === 'rejected' && result.reason?.code === 'INVALID_TOKEN') {
        // Edge case: user reinstalled the app / token rotated. Invalidate
        // silently — the notification still lives in the in-app inbox.
        PushToken.invalidateToken(tokens[i].token).catch(() => {});
      }
    });

    const anySent = results.some((r) => r.status === 'fulfilled');
    return anySent ? { status: 'sent' } : { status: 'failed', error: 'delivery_failed' };
  }
}

module.exports = PushChannel;
