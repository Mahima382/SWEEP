import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationList from './NotificationList';

/**
 * Drop this into any layout's top bar (Household/Collector/Company/Admin
 * all share it, since unread count and delivery are role-agnostic).
 */
export default function NotificationBell({ onAction, onViewAll }) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label="Notifications"
        style={{
          position: 'relative',
          padding: '8px 12px',
          borderRadius: '50px',
          border: '1px solid #d1d5db',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span role="img" aria-label="bell">🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, marginTop: '8px', zIndex: 1000,
        }}
        >
          <NotificationList
            onAction={onAction}
            onViewAll={() => {
              setOpen(false);
              if (onViewAll) {
                onViewAll();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  onAction: PropTypes.func,
  onViewAll: PropTypes.func,
};

NotificationBell.defaultProps = {
  onAction: null,
  onViewAll: null,
};
