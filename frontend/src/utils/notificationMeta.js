// Mirrors backend/utils/constants/notificationConstants.js — keep in sync.

export const CATEGORY_META = {
  PICKUP: { label: 'Pickup', color: '#2E7D32' },
  ORDER: { label: 'Order', color: '#1565C0' },
  PAYMENT: { label: 'Payment', color: '#F9A825' },
  WALLET: { label: 'Wallet', color: '#6A1B9A' },
  SUBSCRIPTION: { label: 'Subscription', color: '#00838F' },
  KYC: { label: 'KYC', color: '#EF6C00' },
  SECURITY: { label: 'Security', color: '#C62828' },
  FRAUD: { label: 'Fraud', color: '#B71C1C' },
  ACCOUNT: { label: 'Account', color: '#455A64' },
  SYSTEM: { label: 'System', color: '#607D8B' },
};

export const PRIORITY_META = {
  NORMAL: { label: 'Normal', color: '#90A4AE' },
  IMPORTANT: { label: 'Important', color: '#FB8C00' },
  URGENT: { label: 'Urgent', color: '#E53935' },
  CRITICAL: { label: 'Critical', color: '#B71C1C' },
};
