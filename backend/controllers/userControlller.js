const action = require('../models/userModel');

async function banUser(req, res){
    let userId = req.params.id;
    let adminId = req.body.admin_id;
    let reason = req.body.reason;

    await action.banUser(userId, adminId, reason);

    console.log(`User ${userId} banned`);
    res.status(200).json({ message: `User ${userId} banned` });
}

module.exports = { banUser }; 
