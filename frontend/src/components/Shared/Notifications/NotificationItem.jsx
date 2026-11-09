import React from 'react';
import PropTypes from 'prop-types';
import { CATEGORY_META, PRIORITY_META } from '../../../utils/notificationMeta';

/**
 * Single notification row. Actions are declarative — this component
 * only reports which action the user picked; the caller decides what
 * to do (accept a pickup, open an order, retry a payment...) so the
 * item stays reusable across every role's inbox (Household, Collector,
 * Company, Admin).
 */
export default function NotificationItem({ notification, onMarkRead, onAction }) {
  const notificationId = notification.id || notification._id;
  const isRead = Boolean(notification.isRead || notification.is_read);
  const typeKey = (notification.category || notification.type || 'SYSTEM').toUpperCase();
  const priorityKey = (notification.priority || 'NORMAL').toUpperCase();

  const category = CATEGORY_META[typeKey] || CATEGORY_META.SYSTEM;
  const priority = PRIORITY_META[priorityKey] || PRIORITY_META.NORMAL;
  const message = notification.message || notification.body;
  const dateStr = new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleTimeString();

  return (
    <div
      role="button"
      tabIndex={0}
      className={`notification-item ${isRead ? 'is-read' : 'is-unread'}`}
      style={{
        display: 'flex',
        gap: '10px',
        padding: '10px 12px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: isRead ? '#ffffff' : '#f0fdf4',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (!isRead && onMarkRead) {
          onMarkRead(notificationId);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isRead && onMarkRead) {
          onMarkRead(notificationId);
        }
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          marginTop: '6px',
          borderRadius: '50%',
          backgroundColor: priority.color,
          flexShrink: 0,
        }}
        title={priority.label}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: category.color,
            }}
          >
            {category.label}
          </span>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{dateStr}</span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>{message}</div>

        {notification.actions && notification.actions.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {notification.actions.map((action) => (
              <button
                key={action.action}
                type="button"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAction) {
                    onAction(action, notification);
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    message: PropTypes.string,
    body: PropTypes.string,
    category: PropTypes.string,
    type: PropTypes.string,
    priority: PropTypes.string,
    is_read: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    isRead: PropTypes.bool,
    created_at: PropTypes.string,
    createdAt: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onMarkRead: PropTypes.func,
  onAction: PropTypes.func,
};

NotificationItem.defaultProps = {
  onMarkRead: null,
  onAction: null,
};
