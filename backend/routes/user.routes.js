/**
 * User routes (FR-12). Mounted at /api/users.
 */

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', userController.getProfile);

module.exports = router;
