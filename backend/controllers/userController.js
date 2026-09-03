/**
 * User controller — profiles & account security (FR-01 profile completion,
 * FR-12). Owns the authenticated user's own profile, including the
 * post-login profile-completion flow described in
 * PROFILE_COMPLETION_SPEC.md (role-specific fields deferred out of the
 * minimal FR-01 registration form).
 */

const userModel = require('../models/userModel');
const { validateProfileData } = require('../utils/validators');

/**
 * Returns the authenticated user's own profile, including whether the
 * post-login profile-completion flow has been finished yet (FR-12).
 * Requires the `authenticate` middleware to have run first.
 *
 * @param {object} req - Express request object; req.user set by authenticate.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json({ user: userModel.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * Saves the role-specific profile-completion data collected after a user's
 * first login (see PROFILE_COMPLETION_SPEC.md) — NID/address for household,
 * KYC documents and service area for local collector, driving licence and
 * vehicle for global collector, or company info/KYC/authorized person for
 * a recycling company. Subscription plan selection (FR-07) happens later,
 * after KYC approval, and is not part of this endpoint.
 *
 * @param {object} req - Express request object; req.user set by
 *   authenticate; body is the role-specific profile payload.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function completeProfile(req, res, next) {
  try {
    const errors = validateProfileData(req.user.role, req.body);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
      return;
    }

    await userModel.completeProfile(req.user.id, req.body || {});
    const user = await userModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json({ user: userModel.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, completeProfile };
