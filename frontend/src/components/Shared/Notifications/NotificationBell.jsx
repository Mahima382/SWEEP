import { useState } from 'react';
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
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none rounded-full px-1.5 py-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationList
            onAction={onAction}
            onViewAll={() => {
              setOpen(false);
              onViewAll?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
