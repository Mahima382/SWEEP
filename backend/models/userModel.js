const db = require("../config/db"); //import database connection

async function banUser(userId, adminId, reason) {
  try {
    let action = "ban";
    let status = "banned";

    let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

    await db.query(command, [status, userId]);

    command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

    await db.query(command, [userId, adminId, action, reason]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function suspendUser(userId, adminId, reason) {
  try {
    let action = "suspend";
    let status = "suspended";

    let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

    await db.query(command, [status, userId]);

    command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

    await db.query(command, [userId, adminId, action, reason]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function reinstateUser(userId, adminId, reason) {
  try {
    let action = "reinstate";
    let status = "active";

    let command = ` UPDATE users
                    SET status = ?
                    WHERE id = ? ; `;

    await db.query(command, [status, userId]);

    command = ` INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
                 VALUES (?, ?, ?, ?); `;

    await db.query(command, [userId, adminId, action, reason]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

module.exports = { banUser, suspendUser, reinstateUser }; //export functions
