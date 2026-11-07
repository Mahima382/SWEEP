const userController = require("../controllers/userController"); //import controllers

const express = require("express");
const router = express.Router(); 

/*
manually pasing req, res to controller function
router.patch('/users/:id/ban', async (req, res) => {
    await userController.banUser(req, res);
});
*/

//modify(patch) an existing user status from active to banned
router.patch('/users/:id/ban', userControlller.banUser); // req, res is passed automatically

//modify(patch) an existing user status from active to suspended
router.patch('/users/:id/suspend', userController.suspendUser); // req, res is passed automatically

//modify(patch) an existing user status from suspended to active
router.patch('/users/:id/reinstate', userController.reinstateUser); // req, res is passed automatically

module.exports = router; //export to server.js 