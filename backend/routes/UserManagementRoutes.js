/**
 * User management routes (FR-11). Mounted at /api/admin/users.
 *
 * Endpoints:
 *   GET     /          - List admin users with search/filter
 *   GET     /:userId   - Get a single user by id
 *   POST    /:userId/suspend - Suspend a user with a reason
 *   POST    /:userId/ban       - Ban a user with a reason
 *   POST    /:userId/reinstate - Reinstate a suspended/banned user
 *   POST    /:userId/confirm   - Handle confirm action from drawer
 *   POST    /:userId/kyc-verify - Verify a user's KYC status
 *   POST    /:userId/kyc-reject - Reject a user's KYC status
 */

const express = require('express');

const router = express.Router();
const controller = require('../controllers/UserManagementController');

router.get('/', controller.listUsers);

router.get('/:userId', controller.getUser);

router.post('/:userId/suspend', controller.suspendOrBanUser);
router.post('/:userId/ban', controller.suspendOrBanUser);

router.post('/:userId/reinstate', controller.reinstateUser);

router.post('/:userId/confirm', controller.handleConfirmAction);

router.post('/:userId/kyc-verify', controller.kycVerifyUser);
router.post('/:userId/kyc-reject', controller.kycRejectUser);

module.exports = router;