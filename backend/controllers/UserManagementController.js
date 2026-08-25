/**
 * User management controller — Admin Portal FR-11.
 * Owns user listing, search, filtering, and status management (suspend/ban/reinstate).
 */

const {
  findAll,
  findById,
  updateStatus,
  updateKycStatus,
  isSuperAdmin,
} = require('../models/userModel');

/**
 * Lists admin users with search and filter support.
 *
 * @param {object} req - Express request query:
 *   - search?: string - Search term for name or email
 *   - role?: string - Filter by role (household, local_collector, global_collector, company, admin)
 *   - status?: string - Filter by status (active, suspended, banned, pending)
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function listUsers(req, res) {
  try {
    const filters = {
      search: req.query.search,
      role: req.query.role,
      status: req.query.status,
    };
    const users = await findAll(filters);
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
}

/**
 * Gets a single user by id.
 *
 * @param {object} req - Express request param: { userId }
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function getUser(req, res) {
  try {
    const user = await findById(parseInt(req.params.userId, 10));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
}

/**
 * Suspends or bans a user with a required reason.
 *
 * Rules enforced:
 * - Suspend/ban requires a reason (enforced by backend, UI also requires it)
 * - Protected super-admin accounts cannot be suspended or banned
 * - User's status is updated to 'suspended' or 'banned'
 *
 * @param {object} req - Express request:
 *   - req.params.userId - The user's id
 *   - req.body.action - Either "Suspend" or "Ban"
 *   - req.body.reason - The reason for suspend/ban (required)
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function suspendOrBanUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { action, reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required for suspend/ban actions' });
    }

    // Check if user is a protected super-admin
    const isSuper = await isSuperAdmin(userId);
    if (isSuper) {
      return res.status(403).json({ error: 'Action blocked: protected super-admin accounts cannot be suspended or banned' });
    }

    // Get current user to check role (should be admin, enforced by middleware)
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update user status
    const affectedRows = await updateStatus(userId, {
      status: action === 'Ban' ? 'banned' : 'suspended',
      reason: reason.trim(),
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: `User ${action} successfully`,
      userId,
      newStatus: action === 'Ban' ? 'banned' : 'suspended',
      reason: reason.trim(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to suspend/ban user' });
  }
}

/**
 * Reinstates a suspended or banned user.
 *
 * Rules:
 * - Only users with status 'suspended' or 'banned' can be reinstated
 * - User's status is updated to 'active'
 * - Reason is cleared
 *
 * @param {object} req - Express request param: { userId }
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function reinstateUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Get current user to check role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update user status to active, clear reason
    const affectedRows = await updateStatus(userId, {
      status: 'active',
      reason: null,
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User reinstated successfully',
      userId,
      newStatus: 'active',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to reinstate user' });
  }
}

/**
 * Handles the confirm action from the UserManagement drawer (suspend/ban with reason textarea).
 *
 * This is called when the user clicks "Confirm Suspend" or "Confirm Ban" in the drawer.
 *
 * @param {object} req - Express request:
 *   - req.params.userId - The user's id
 *   - req.body.action - Either "Suspend" or "Ban"
 *   - req.body.reason - The reason text (required)
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function handleConfirmAction(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { action, reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required for suspend/ban actions' });
    }

    // Check if user is a protected super-admin
    const isSuper = await isSuperAdmin(userId);
    if (isSuper) {
      return res.status(403).json({ error: 'Action blocked: protected super-admin accounts cannot be suspended or banned' });
    }

    // Update user status
    const affectedRows = await updateStatus(userId, {
      status: action === 'Ban' ? 'banned' : 'suspended',
      reason: reason.trim(),
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: `User ${action} successfully`,
      userId,
      newStatus: action === 'Ban' ? 'banned' : 'suspended',
      reason: reason.trim(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to process confirm action' });
  }
}

/**
 * Verifies a user's KYC status.
 *
 * Rules enforced:
 * - KYC verification requires authenticated admin
 * - User's kyc_status is updated to 'verified'
 * - Protected super-admin accounts can be KYC-verified
 *
 * @param {object} req - Express request:
 *   - req.params.userId - The user's id
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function kycVerifyUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Get current user to check role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update user KYC status to verified
    const affectedRows = await updateKycStatus(userId, 'verified');

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User KYC verified successfully',
      userId,
      newKycStatus: 'verified',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to verify user KYC' });
  }
}

/**
 * Rejects a user's KYC status.
 *
 * Rules enforced:
 * - KYC rejection requires a reason (enforced by backend)
 * - User's kyc_status is updated to 'rejected'
 * - Reason is required and must not be empty
 * - Protected super-admin accounts can have KYC rejected
 *
 * @param {object} req - Express request:
 *   - req.params.userId - The user's id
 *   - req.body.reason - The reason for KYC rejection (required)
 * @param {object} res - Express response object.
 * @returns {void}
 */
async function kycRejectUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required for KYC rejection' });
    }

    // Get current user to check role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update user KYC status to rejected with reason
    const affectedRows = await updateKycStatus(userId, 'rejected', reason);

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User KYC rejected successfully',
      userId,
      newKycStatus: 'rejected',
      reason: reason.trim(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to reject user KYC' });
  }
}

module.exports = {
  listUsers,
  getUser,
  suspendOrBanUser,
  reinstateUser,
  handleConfirmAction,
  kycVerifyUser,
  kycRejectUser,
};