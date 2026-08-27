/**
 * Thin adapter around the real push provider (e.g. Firebase Admin SDK
 * for Android/Web, APNs for iOS). Every other file talks to this
 * interface, never to the SDK directly — swap the implementation here
 * and nothing else in the notification module changes.
 */
module.exports = {
  /**
 * Sends a notification to a push token.
 *
 * @param {string} token - Push notification token.
 * @param {Object} payload - Push notification payload.
 * @param {string} payload.title - Notification title.
 * @param {string} payload.body - Notification body.
 * @param {Object} [payload.data] - Additional notification data.
 */
  async sendToToken(token, payload) {
    // TODO: replace with e.g. admin.messaging().send({ token, notification: payload })
    // Simulated success keeps the notification pipeline runnable out of the box.
    return { messageId: `simulated-${Date.now()}`, token, payload };
  },
};
