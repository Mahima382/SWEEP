// backend/models/NotificationPreference.js

const pool = require('../config/db');

/**
 * Provides CRUD operations for notification preferences.
 */
class NotificationPreference {
  /**
   * Returns the preference for a category.
   *
   * If the user has not customized the category, sensible defaults
   * are returned.
   *
   * @param {number} userId - User ID.
   * @param {string} category - Notification category.
   * @returns {Promise<Object>} Category preference.
   */
  static async getCategoryPref(userId, category) {
    const [rows] = await pool.execute(
      `SELECT category, in_app AS inApp, push, email, muted
       FROM notification_preferences
       WHERE user_id = ? AND category = ?
       LIMIT 1`,
      [userId, category],
    );

    return rows[0] || {
      category,
      inApp: true,
      push: true,
      email: false,
      muted: false,
    };
  }

  /**
   * Returns all notification preferences for a user.
   *
   * @param {number} userId - User ID.
   * @returns {Promise<Array>} User notification preferences.
   */
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT
         category,
         in_app AS inApp,
         push,
         email,
         muted
       FROM notification_preferences
       WHERE user_id = ?
       ORDER BY category`,
      [userId],
    );

    return rows;
  }

  /**
   * Creates or updates a user's preference for a category.
   *
   * @param {number} userId - User ID.
   * @param {string} category - Notification category.
   * @param {boolean} inApp - Enable in-app notifications.
   * @param {boolean} push - Enable push notifications.
   * @param {boolean} email - Enable email notifications.
   * @param {boolean} muted - Mute the category.
   * @returns {Promise<Object>} Updated preference.
   */
  static async upsert(
    userId,
    category,
    inApp = true,
    push = true,
    email = false,
    muted = false,
  ) {
    await pool.execute(
      `INSERT INTO notification_preferences
       (user_id, category, in_app, push, email, muted)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         in_app = VALUES(in_app),
         push = VALUES(push),
         email = VALUES(email),
         muted = VALUES(muted)`,
      [
        userId,
        category,
        inApp,
        push,
        email,
        muted,
      ],
    );

    return this.getCategoryPref(userId, category);
  }
}

module.exports = NotificationPreference;