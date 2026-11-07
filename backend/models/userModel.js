const db = require("../config/db"); //import database connection

/**
 * Bans user by updating their status to "banned"
 * and logging the action in the user_admin_actions table.
 *
 * @param {number | string} userId - the ID of the user to be banned
 * @param {number | string} adminId - the ID of the admin performing the action
 * @param {string} reason - the reason for admin banning the user
 *
 * @returns {Promise<void>}
 */
async function banUser(userId, adminId, reason) {
  let action = "ban";
  let status = "banned";

  let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

  await db.query(command, [status, userId]);

  command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

  await db.query(command, [userId, adminId, action, reason]);
}

/**
 * Suspends user by updating their status to "suspended"
 * and logging the action in the user_admin_actions table.
 *
 * @param {number | string} userId - the ID of the user to be suspended
 * @param {number | string} adminId - the ID of the admin performing the action
 * @param {string} reason - the reason for admin suspending the user
 *
 * @returns {Promise<void>}
 */
async function suspendUser(userId, adminId, reason) {
  let action = "suspend";
  let status = "suspended";

  let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

  await db.query(command, [status, userId]);

  command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

  await db.query(command, [userId, adminId, action, reason]);
}

/**
 * Reinstates user by updating their status to "active"
 * and logging the action in the user_admin_actions table.
 *
 * @param {number | string} userId - the ID of the user to be reinstated
 * @param {number | string} adminId - the ID of the admin performing the action
 * @param {string} reason - the reason for admin reinstating the user
 *
 * @returns {Promise<void>}
 */
async function reinstateUser(userId, adminId, reason) {
  let action = "reinstate";
  let status = "active";

  let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

  await db.query(command, [status, userId]);

  command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

  await db.query(command, [userId, adminId, action, reason]);
}

module.exports = { banUser, suspendUser, reinstateUser }; //export functions to controller
