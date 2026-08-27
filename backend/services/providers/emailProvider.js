/**
 * Thin adapter around the real email provider (e.g. Nodemailer/SES/SendGrid).
 */
module.exports = {
  /** @param {{ to: string, subject: string, body: string }} message */
  async send({ to, subject, body }) {
    // TODO: replace with a real transport.
    return {
      to, subject, body, sentAt: new Date().toISOString(),
    };
  },
};
