import { useNotifications } from '../../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

/**
 * Dropdown panel used by NotificationBell. For the full paginated inbox
 * see pages/NotificationsPage.jsx — this component only renders
 * whatever the context currently holds (the most recent page).
 */
export default function NotificationList({ onAction, onViewAll }) {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="font-semibold text-sm">Notifications</span>
        <button type="button" className="text-xs text-blue-600 hover:underline" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      {loading && <p className="p-4 text-sm text-gray-500">Loading…</p>}
      {!loading && notifications.length === 0 && (
        <p className="p-4 text-sm text-gray-500">You&apos;re all caught up.</p>
      )}

      {notifications.map((n) => (
        <NotificationItem key={n._id} notification={n} onMarkRead={markAsRead} onAction={onAction} />
      ))}

      <button
        type="button"
        className="w-full p-2 text-xs text-center text-blue-600 hover:bg-gray-50 border-t"
        onClick={onViewAll}
      >
        View all
      </button>
    </div>
  );
}
