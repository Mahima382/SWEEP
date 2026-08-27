// backend/models/PushToken.js

const pool = require('../config/db');

/**
 * Provides CRUD operations for user push notification tokens.
 */
class PushToken {
  /**
   * Registers or updates a push token for a user.
   *
   * @param {number} userId - User ID.
   * @param {string} token - Push notification token.
   * @param {string} platform - Client platform.
   * @returns {Promise<Object>} Registered push token.
   */
  static async register(userId, token, platform) {
    await pool.execute(
      `INSERT INTO push_tokens
       (user_id, token, platform, is_valid, last_seen_at)
       VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         platform = VALUES(platform),
         is_valid = TRUE,
         last_seen_at = CURRENT_TIMESTAMP`,
      [userId, token, platform],
    );

    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id AS userId,
         token,
         platform,
         is_valid AS isValid,
         last_seen_at AS lastSeenAt
       FROM push_tokens
       WHERE token = ?
       LIMIT 1`,
      [token],
    );

    return rows[0] || null;
  }

  /**
   * Returns all valid push tokens for a user.
   *
   * @param {number} userId - User ID.
   * @returns {Promise<Array>} Valid push tokens.
   */
  static async findValidByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id AS userId,
         token,
         platform,
         is_valid AS isValid,
         last_seen_at AS lastSeenAt
       FROM push_tokens
       WHERE user_id = ?
         AND is_valid = TRUE`,
      [userId],
    );

    return rows;
  }

  /**
   * Invalidates a push token.
   *
   * The token is retained so that an invalid token can be tracked.
   *
   * @param {string} token - Push notification token.
   * @returns {Promise<boolean>} Whether the token was updated.
   */
  static async invalidateToken(token) {
    const [result] = await pool.execute(
      `UPDATE push_tokens
       SET is_valid = FALSE
       WHERE token = ?`,
      [token],
    );

    return result.affectedRows > 0;
  }

  /**
   * Removes a push token belonging to a user.
   *
   * @param {number} userId - User ID.
   * @param {string} token - Push notification token.
   * @returns {Promise<boolean>} Whether the token was deleted.
   */
  static async remove(userId, token) {
    const [result] = await pool.execute(
      `DELETE FROM push_tokens
       WHERE user_id = ? AND token = ?`,
      [userId, token],
    );

    return result.affectedRows > 0;
  }
}

module.exports = PushToken;