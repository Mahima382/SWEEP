/**
 * Auth controller — Registration & Login (FR-01, FR-02).
 * Owns register/login/logout flows for all four roles.
 */

const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const {
  isValidEmail, isValidPassword, isValidMobile, isValidRole,
} = require('../utils/validators');

const SALT_ROUNDS = 10;

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
 * Placeholder for login with role-based routing and 5-attempt lockout (FR-02).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void}
 */
function login(req, res) {
  res.status(501).json({ message: 'Auth — not implemented yet (FR-02)' });
}

module.exports = { register, login };
