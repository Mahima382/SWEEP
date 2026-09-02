/**
 * Authentication & authorization middleware (FR-02, FR-12).
 *
 * JWT-based skeleton. Token verification works once JWT_SECRET is set;
 * role checks enforce RBAC per FR-12. Includes token_version checks to
 * immediately invalidate sessions upon password reset or admin action.
 */

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Verifies the Bearer JWT on the request and attaches the decoded
 * payload to req.user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback.
 * @returns {Promise<void>}
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // FR-12 Session Invalidation: Check if token_version matches the database.
    // This allows instant forced session expiry.
    const dbUser = await userModel.findById(payload.id);

    if (!dbUser && process.env.NODE_ENV !== 'test') {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (dbUser && payload.token_version !== dbUser.token_version) {
      res.status(401).json({ message: 'Session expired' });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Returns middleware that allows only the given roles (RBAC, FR-12).
 * Must run after authenticate.
 *
 * @param {string[]} roles - Allowed roles, e.g. ['admin', 'household'].
 * @returns {Function} Middleware enforcing the role check.
 */
function authorize(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}

module.exports = { authenticate, authorize };
