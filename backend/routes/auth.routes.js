/**
 * Auth routes (FR-01, FR-02). Mounted at /api/auth.
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
