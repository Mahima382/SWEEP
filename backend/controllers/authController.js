/**
 * Auth controller — Registration & Login (FR-01, FR-02).
 * Owns register/login/logout flows for all four roles.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const {
  isValidEmail, isValidPassword, isValidMobile, isValidRole,
} = require('../utils/validators');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';
const GENERIC_LOGIN_ERROR = 'Invalid email or password.';
/** How long a password-reset link stays valid (FR-12 password reset). */
const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;
/** Shown regardless of whether the email exists, to avoid leaking which emails are registered. */
const GENERIC_FORGOT_PASSWORD_MESSAGE = 'If an account exists for that email, a password reset link has been sent.';

/** Roles whose account stays pending until an admin approves KYC (locked registration rules). */
const KYC_PENDING_ROLES = ['collector', 'global', 'company'];

/**
 * Registers a new account for one of the four self-service roles
 * (household, collector, global, company) — FR-01.
 *
 * Only the minimal credential fields are collected here (full name, email,
 * mobile, password); role-specific KYC/profile fields are gathered later in
 * the post-login profile completion flow (see PROFILE_COMPLETION_SPEC.md).
 * Local Collector, Global Collector, and Company accounts are created with
 * status "pending_kyc"; Household accounts (no KYC required) start "active".
 *
 * @param {object} req - Express request object; body: { accountType, fullName,
 *   email, mobile, password }.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function register(req, res, next) {
  try {
    const {
      accountType, fullName, email, mobile, password,
    } = req.body || {};

    if (!isValidRole(accountType)) {
      res.status(400).json({ message: 'accountType must be one of household, collector, global, company.' });
      return;
    }
    if (!fullName || !fullName.trim()) {
      res.status(400).json({
        message: accountType === 'company' ? 'Company name is required.' : 'Full name is required.',
      });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Enter a valid email address.' });
      return;
    }
    if (!isValidMobile(mobile)) {
      res.status(400).json({ message: 'Enter an 11-digit Bangladeshi mobile number (e.g. 01XXXXXXXXX).' });
      return;
    }
    if (!isValidPassword(password)) {
      res.status(400).json({
        message: 'Password must be at least 8 characters, with an uppercase, lowercase, number and special character.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const status = KYC_PENDING_ROLES.includes(accountType) ? 'pending_kyc' : 'active';
    const trimmedName = fullName.trim();

    const id = await userModel.create({
      role: accountType,
      fullName: trimmedName,
      email: normalizedEmail,
      mobile: mobile.trim(),
      passwordHash,
      status,
    });

    res.status(201).json({
      user: {
        id,
        role: accountType,
        fullName: trimmedName,
        email: normalizedEmail,
        mobile: mobile.trim(),
        status,
        profileCompleted: false,
      },
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }
    next(err);
  }
}

/**
 * Logs a user in: verifies credentials, enforces the 5-attempt lockout and
 * suspended/banned account blocks, and issues a JWT carrying the role used
 * for client-side role-based routing (FR-02).
 *
 * @param {object} req - Express request object; body: { email, password }.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || typeof password !== 'string' || !password) {
      res.status(400).json({ message: 'Enter a valid email address and password.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findByEmail(normalizedEmail);
    if (!user) {
      res.status(401).json({ message: GENERIC_LOGIN_ERROR });
      return;
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      res.status(403).json({ message: 'This account has been suspended. Contact support for help.' });
      return;
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      res.status(423).json({
        message: 'Too many failed login attempts. Please try again in 15 minutes.',
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      const { attempts, lockedUntil } = await userModel.registerFailedLogin(user.id);
      if (lockedUntil) {
        res.status(423).json({
          message: 'Too many failed login attempts. Please try again in 15 minutes.',
        });
        return;
      }
      const remaining = userModel.LOCKOUT_THRESHOLD - attempts;
      res.status(401).json({
        message: `${GENERIC_LOGIN_ERROR} ${remaining} attempt(s) remaining before your account is locked.`,
      });
      return;
    }

    await userModel.clearFailedLogins(user.id);

    const token = jwt.sign(
      {
        id: user.id, role: user.role, email: user.email, fullName: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.full_name,
        email: user.email,
        status: user.status,
        profileCompleted: !!user.profile_completed,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Starts the password-reset flow for an account (FR-12). Always responds
 * with the same generic message regardless of whether the email is
 * registered, to avoid leaking which emails have accounts.
 *
 * There is no email/SMS provider wired into this project (deliberately
 * small stack — see CLAUDE.md §12.8), so there is no way to deliver the
 * reset link out of band. When the account exists, the generated token is
 * returned directly in the response body so the flow is actually usable
 * end to end; in a production deployment with a mail provider, the token
 * would be emailed instead and dropped from this response.
 *
 * @param {object} req - Express request object; body: { email }.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Enter a valid email address.' });
      return;
    }

    const user = await userModel.findByEmail(email.trim().toLowerCase());
    if (!user) {
      res.status(200).json({ message: GENERIC_FORGOT_PASSWORD_MESSAGE });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();
    await userModel.setResetToken(user.id, resetToken, expiresAt);

    res.status(200).json({
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
      resetToken,
      resetTokenExpiresAt: expiresAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Completes the password-reset flow: verifies the token issued by
 * forgotPassword, sets a new password, and consumes the token so it can't
 * be replayed (FR-12).
 *
 * @param {object} req - Express request object; body: { token, password }.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback, used to forward unexpected
 *   errors.
 * @returns {Promise<void>}
 */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};

    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'A reset token is required.' });
      return;
    }
    if (!isValidPassword(password)) {
      res.status(400).json({
        message: 'Password must be at least 8 characters, with an uppercase, lowercase, number and special character.',
      });
      return;
    }

    const user = await userModel.findByResetToken(token);
    if (!user) {
      res.status(400).json({ message: 'This reset link is invalid or has expired.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await userModel.resetPassword(user.id, passwordHash);

    res.status(200).json({ message: 'Your password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register, login, forgotPassword, resetPassword,
};
