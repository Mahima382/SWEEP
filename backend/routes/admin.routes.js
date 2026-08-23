/**
 * Admin routes (FR-11). Mounted at /api/admin.
 */

const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/users', adminController.getUsers);

module.exports = router;
