/**
 * Auth controller — Registration & Login (FR-01, FR-02), Password Reset
 * & Session Management (FR-12).
 * Owns register/login/logout flows for all four roles, and FR-12 security actions.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Validates password strength (minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special).
 */
function isValidPassword(password) {
  if (password.length < 8) { return false; }
  if (!/[A-Z]/.test(password)) { return false; }
  if (!/[a-z]/.test(password)) { return false; }
  if (!/[0-9]/.test(password)) { return false; }
  if (!/[^a-zA-Z0-9]/.test(password)) { return false; }
  return true;
}

/**
 * User registration (FR-01, FR-12).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
async function register(req, res) {
  try {
    const {
      name, email, phone, nid, password, role, region,
    } = req.body;

    if (!name || !email || !phone || !nid || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password does not meet strength requirements' });
    }

    // FR-12: Blacklist Check
    const isBlacklisted = await userModel.isBlacklisted(nid, email);
    if (isBlacklisted) {
      return res.status(403).json({ message: 'This identity is not eligible for registration' });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const existingNid = await userModel.findByNid(nid);
    if (existingNid) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const kycStatus = (role === 'household') ? 'verified' : 'pending';
    const status = 'active'; // In a full flow, email verification might make this 'pending'

    await userModel.create({
      name,
      email,
      phone,
      nid,
      password_hash: passwordHash,
      role,
      region: region || null,
      kyc_status: kycStatus,
      status,
    });

    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
}

/**
 * User login with role-based routing and 5-attempt lockout (FR-02, FR-12).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({ message: 'Your account access has been restricted. Contact support.' });
    }

    // Lockout check
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return res.status(403).json({ message: 'Account temporarily locked. Please try again later.' });
    }

    // Lazy KYC Auto-deactivation Check (FR-12)
    if (user.kyc_status === 'rejected' && user.kyc_rejected_at) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(user.kyc_rejected_at) < thirtyDaysAgo) {
        await userModel.updateStatus(user.id, { status: 'suspended', reason: 'KYC not resubmitted within 30 days' });
        await emailService.sendKycDeactivationEmail(user.email);
        return res.status(403).json({ message: 'Account deactivated due to KYC rejection without resubmission.' });
      }
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const attempts = (user.login_attempts || 0) + 1;
      let lockoutUntil = null;
      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      }
      await userModel.updateLoginAttempts(user.id, attempts, lockoutUntil);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Success - reset attempts
    if (user.login_attempts > 0 || user.lockout_until) {
      await userModel.updateLoginAttempts(user.id, 0, null);
    }

    const expiresIn = rememberMe ? '30d' : '30m';
    const payload = {
      id: user.id,
      role: user.role,
      token_version: user.token_version || 0,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    return res.json({ token, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
}

/**
 * Initiates a password reset request (FR-12).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await userModel.findByEmail(email);
    // Always return success even if user not found to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await userModel.saveResetToken(user.id, hashedToken, expires);

    // In a real app, this would be a full URL with the raw `resetToken`
    // (not the hashed one) and the user's `email`.
    const resetLink = `https://sweep.eco/reset-password?token=${resetToken}`
      + `&email=${encodeURIComponent(user.email)}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink);

    return res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to process request' });
  }
}

/**
 * Completes a password reset request (FR-12).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await userModel.findByEmail(email);
    if (!user || !user.reset_token || !user.reset_expires) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const hashedInputToken = crypto.createHash('sha256').update(token).digest('hex');
    if (hashedInputToken !== user.reset_token) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'Password does not meet strength requirements' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must differ from the previous password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password, clear reset fields, and increment token_version (invalidating all sessions)
    await userModel.updatePassword(user.id, newHash);
    await userModel.clearResetToken(user.id);
    await userModel.incrementTokenVersion(user.id);

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to reset password' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
