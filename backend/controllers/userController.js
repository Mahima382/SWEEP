const userModel = require("../models/userModel"); //import user model functions

/**
 * decides which model function to call
 * for banning user
 * 
 * @param {object} req 
 * @param {object} res 
 * 
 * @returns {Promise<void>}
 */
async function banUser(req, res) {
  try {
    let userId = req.params.id;
    let adminId = req.body.admin_id;
    let reason = req.body.reason;

    await userModel.banUser(userId, adminId, reason);

    console.log(`User ${userId} banned`);
    res.status(200).json({ message: `User ${userId} banned` });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


/**
 * decides which model function to call
 * for suspending user
 * 
 * @param {object} req 
 * @param {object} res 
 * 
 * @returns {Promise<void>}
 */
async function suspendUser(req, res) {
  try {
    let userId = req.params.id;
    let adminId = req.body.admin_id;
    let reason = req.body.reason;

    await userModel.suspendUser(userId, adminId, reason);

    console.log(`User ${userId} suspended`);
    res.status(200).json({ message: `User ${userId} suspended` });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * decides which model function to call
 * for reinstating user
 * 
 * @param {object} req 
 * @param {object} res 
 * 
 * @returns {Promise<void>}
 */
async function reinstateUser(req, res) {
  try {
    let userId = req.params.id;
    let adminId = req.body.admin_id;
    let reason = req.body.reason;

    await userModel.reinstateUser(userId, adminId, reason);

    console.log(`User ${userId} reinstated`);
    res.status(200).json({ message: `User ${userId} reinstated` });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { banUser, suspendUser, reinstateUser }; //export controller functions to userRoutes.js
