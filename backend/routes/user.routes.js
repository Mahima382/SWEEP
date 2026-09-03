/**
 * User routes (FR-01 profile completion, FR-12). Mounted at /api/users.
 */

const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, userController.getProfile);
router.patch('/me/profile', authenticate, userController.completeProfile);

module.exports = router;
