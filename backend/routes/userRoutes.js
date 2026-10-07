const call = require("../controllers/userController"); //import controllers

const express = require("express");
const router = express.Router(); 

//modify an existing user status from active to banned
router.patch('/users/:id/ban', async (req, res) => {
    await call.banUser(req, res);
});

module.exports = router; //export for server.js 