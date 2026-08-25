const Notification = require('../../models/Notification');
const NotificationPreference = require('../../models/NotificationPreference');
const PushToken = require('../../models/PushToken');
const NotificationFactory = require('./NotificationFactory');
const dispatcher = require('./NotificationDispatcher');

const PAGE_SIZE_DEFAULT = 20;

/**
 * Orchestrates notification creation, persistence, deduplication,
 * preference resolution and delivery. Controllers and event handlers
 * are the only callers — every business rule lives here, keeping the
 * controller layer thin (MVC) and the rest of the app decoupled from
 * delivery mechanics.
 */
class NotificationService {
  /**
   * Create (or no-op if a duplicate) and dispatch a notification.
   * @param {{ recipientId: string, recipientRole: string, event: string, data: object }} params
   */
  async notify({ recipientId, recipientRole, event, data }) {
    const built = NotificationFactory.create(event, data);

    // Idempotent upsert on (recipient, dedupeKey) — prevents duplicate
    // inbox entries when the same domain event is published twice
    // (FR-09 failure case: "Duplicate notification event is received").
    const result = await Notification.findOneAndUpdate(
      { recipient: recipientId, dedupeKey: built.dedupeKey },
      {
        $setOnInsert: {
          recipient: recipientId,
          recipientRole,
          event: built.event,
          category: built.category,
          priority: built.priority,
          mandatory: built.mandatory,
          title: built.title,
          body: built.body,
          data: built.data,
          actions: built.actions,
          dedupeKey: built.dedupeKey,
        },
      },
      { upsert: true, new: true, rawResult: true, setDefaultsOnInsert: true }
    );

    const notification = Notification.hydrate(result.value);
    const wasAlreadyPresent = Boolean(result.lastErrorObject?.updatedExisting);
    if (wasAlreadyPresent) {
      return notification; // duplicate event — already created/delivered, skip re-dispatch
    }

    // Mandatory notifications (Security, critical account/fraud/subscription
    // events) bypass user preferences entirely — this is the one place that
    // rule is enforced, per the FR-09 acceptance criteria.
    const channels = built.mandatory
      ? built.defaultChannels
      : await this._resolveChannels(recipientId, built.category, built.defaultChannels);

    if (channels.length === 0) {
      return notification; // user muted this category entirely
    }

    // Lazy require avoids a circular dependency with the User model at module load time.
    const User = require('../../models/User');
    const recipientUser = (await User.findById(recipientId).select('email').lean()) || {};
    recipientUser.id = recipientId;

    return dispatcher.dispatch(notification, recipientUser, channels);
  }

  async _resolveChannels(userId, category, defaultChannels) {
    const pref = await NotificationPreference.findOne({ user: userId });
    if (!pref) return defaultChannels;

    const categoryPref = pref.getCategoryPref(category);
    if (categoryPref.muted) return [];

    return defaultChannels.filter((channel) => {
      if (channel === 'PUSH') return categoryPref.push;
      if (channel === 'EMAIL') return categoryPref.email;
      if (channel === 'IN_APP') return categoryPref.inApp;
      return true;
    });
  }

  async listForUser(userId, { category, isRead, page = 1, limit = PAGE_SIZE_DEFAULT } = {}) {
    const query = { recipient: userId };
    if (category) query.category = category;
    if (typeof isRead === 'boolean') query.isRead = isRead;

    const [items, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  getUnreadCount(userId) {
    return Notification.getUnreadCount(userId);
  }

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
    if (!notification) return null;
    notification.markAsRead();
    await notification.save();
    return notification;
  }

  markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  async getPreferences(userId) {
    const pref = await NotificationPreference.findOne({ user: userId });
    return pref || { user: userId, categories: [] };
  }

  /**
   * Persists the user's channel/mute choices as given. Mandatory
   * notifications (see NotificationFactory) ignore these preferences
   * at dispatch time regardless of what's saved here, so there is no
   * need to special-case "un-mutable" categories in this method.
   * @param {string} userId
   * @param {Array<{category: string, inApp?: boolean, push?: boolean, email?: boolean, muted?: boolean}>} categories
   */
  updatePreferences(userId, categories) {
    return NotificationPreference.findOneAndUpdate(
      { user: userId },
      { $set: { categories } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  registerPushToken(userId, token, platform) {
    return PushToken.findOneAndUpdate(
      { token },
      { user: userId, token, platform, isValid: true, lastSeenAt: new Date() },
      { upsert: true, new: true }
    );
  }

  removePushToken(userId, token) {
    return PushToken.deleteOne({ user: userId, token });
  }
}

module.exports = new NotificationService();
