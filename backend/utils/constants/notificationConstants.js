/**
 * Shared enums for the notification module (FR-09).
 * Keeping these in one place means the model schema, the factory rules,
 * the frontend meta table, and any future admin tooling all agree on the
 * same vocabulary.
 */

const NOTIFICATION_CATEGORIES = Object.freeze({
  PICKUP: 'PICKUP',
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  WALLET: 'WALLET',
  SUBSCRIPTION: 'SUBSCRIPTION',
  KYC: 'KYC',
  SECURITY: 'SECURITY',
  FRAUD: 'FRAUD',
  ACCOUNT: 'ACCOUNT',
  SYSTEM: 'SYSTEM',
});

const NOTIFICATION_PRIORITIES = Object.freeze({
  NORMAL: 'NORMAL',
  IMPORTANT: 'IMPORTANT',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL',
});

const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
  EMAIL: 'EMAIL',
});

module.exports = {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CHANNELS,
};
