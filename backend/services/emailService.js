/**
 * Mock email service for sending notifications.
 * In a real application, this would use Nodemailer, SendGrid, etc.
 */

/**
 * Sends a password reset email.
 *
 * @param {string} email - The recipient's email address
 * @param {string} resetLink - The password reset link
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(email, resetLink) {
  // eslint-disable-next-line no-console
  console.log(`[EmailService] Sending password reset link to ${email}: ${resetLink}`);
  return Promise.resolve();
}

/**
 * Sends a KYC auto-deactivation notification email.
 *
 * @param {string} email - The recipient's email address
 * @returns {Promise<void>}
 */
async function sendKycDeactivationEmail(email) {
  // eslint-disable-next-line no-console
  console.log(`[EmailService] Sending KYC deactivation notice to ${email}`);
  return Promise.resolve();
}

module.exports = {
  sendPasswordResetEmail,
  sendKycDeactivationEmail,
};
