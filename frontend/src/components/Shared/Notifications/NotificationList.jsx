import React from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

/**
 * Dropdown panel used by NotificationBell.
 */
export default function NotificationList({ onAction, onViewAll }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div
      style={{
        width: '320px',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
          Notifications
        </span>
        <button
          type="button"
          style={{
            fontSize: '11px',
            color: '#16a34a',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ padding: '16px', fontSize: '13px', color: '#6b7280', margin: 0, textAlign: 'center' }}>
          You&apos;re all caught up.
        </p>
      ) : (
        notifications.map((n) => (
          <NotificationItem
            key={n.id || n._id}
            notification={n}
            onMarkRead={markAsRead}
            onAction={onAction}
          />
        ))
      )}

      {onViewAll && (
        <button
          type="button"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '12px',
            color: '#16a34a',
            backgroundColor: '#ffffff',
            border: 'none',
            borderTop: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontWeight: 600,
            textAlign: 'center',
          }}
          onClick={onViewAll}
        >
          View all notifications
        </button>
      )}
    </div>
  );
}

NotificationList.propTypes = {
  onAction: PropTypes.func,
  onViewAll: PropTypes.func,
};

NotificationList.defaultProps = {
  onAction: null,
  onViewAll: null,
};
