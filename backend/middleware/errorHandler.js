/**
 * Central Express error-handling middleware.
 *
 * Registered last in app.js. Any error passed to next(err) lands here
 * and is converted into a consistent JSON error response.
 *
 * @param {Error} err - The error forwarded by a controller or middleware.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next callback
 *   (unused, but required by the 4-argument error-handler signature).
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'Something went wrong',
  });
}

module.exports = errorHandler;
