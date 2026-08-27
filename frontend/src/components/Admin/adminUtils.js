/**
 * Shared display helpers for the Admin Portal (FR-11). Keeps role/status labels
 * and money formatting consistent across every admin screen.
 */

const ROLE_LABELS = {
  household: 'Household',
  local_collector: 'Local Collector',
  global_collector: 'Global Collector',
  company: 'Company',
  admin: 'Admin',
};

/**
 * Human-readable label for a backend role code.
 * @param {string} role Backend role code.
 * @returns {string} Display label.
 */
export function roleLabel(role) {
  return ROLE_LABELS[role] || role || '—';
}

/**
 * Format a number as Bangladeshi Taka.
 * @param {number} amount Amount in Taka.
 * @returns {string} e.g. "৳12,840".
 */
export function formatTaka(amount) {
  const n = Number(amount) || 0;
  return `৳${n.toLocaleString('en-IN')}`;
}

/**
 * Initials for an avatar from a name.
 * @param {string} name Full name / business name.
 * @returns {string} Up to two uppercase initials.
 */
export function initials(name) {
  if (!name) { return '?'; }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) { return parts[0].slice(0, 2).toUpperCase(); }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const BADGE_MAP = {
  active: 'Active',
  suspended: 'Suspended',
  banned: 'Banned',
  pending: 'Pending',
  verified: 'Verified',
  under_review: 'Under Review',
  rejected: 'Rejected',
  cleared: 'Cleared',
  escalated: 'Escalated',
  open: 'Open',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

/**
 * Map a backend status/severity string to the capitalised label the
 * StatusBadge component understands (e.g. 'under_review' -> 'Under Review').
 * @param {string} status Backend status code.
 * @returns {string} Badge label.
 */
export function statusBadgeValue(status) {
  return BADGE_MAP[status] || status || '—';
}
