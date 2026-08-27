// backend/models/Notification.js

const pool = require('../config/db');

class Notification {
  static async create({
    recipientId,
    type,
    priority = 'Normal',
    title,
    message,
    referenceType = null,
    referenceId = null,
    actionType = null,
    actionUrl = null,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO notifications
       (
         recipient_id,
         type,
         priority,
         title,
         message,
         reference_type,
         reference_id,
         action_type,
         action_url
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipientId,
        type,
        priority,
        title,
        message,
        referenceType,
        referenceId,
        actionType,
        actionUrl,
      ],
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM notifications
       WHERE id = ?`,
      [id],
    );

    return rows[0] || null;
  }

  static async findByUser(
    recipientId,
    { limit = 20, offset = 0, unreadOnly = false } = {},
  ) {
    const condition = unreadOnly
      ? 'AND is_read = FALSE'
      : '';

    const [rows] = await pool.execute(
      `SELECT *
       FROM notifications
       WHERE recipient_id = ?
       ${condition}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [recipientId, Number(limit), Number(offset)],
    );

    return rows;
  }

  static async countUnread(recipientId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS unreadCount
       FROM notifications
       WHERE recipient_id = ?
       AND is_read = FALSE`,
      [recipientId],
    );

    return rows[0].unreadCount;
  }

  static async markAsRead(id, recipientId) {
    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = TRUE,
           read_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND recipient_id = ?
       AND is_read = FALSE`,
      [id, recipientId],
    );

    return result.affectedRows > 0;
  }

  static async markAllAsRead(recipientId) {
    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = TRUE,
           read_at = CURRENT_TIMESTAMP
       WHERE recipient_id = ?
       AND is_read = FALSE`,
      [recipientId],
    );

    return result.affectedRows;
  }
}

module.exports = Notification;