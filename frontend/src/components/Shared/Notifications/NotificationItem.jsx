import { CATEGORY_META, PRIORITY_META } from '../../../utils/notificationMeta';

/**
 * Single notification row. Actions are declarative — this component
 * only reports which action the user picked; the caller decides what
 * to do (accept a pickup, open an order, retry a payment...) so the
 * item stays reusable across every role's inbox (Household, Collector,
 * Company, Admin).
 */
export default function NotificationItem({ notification, onMarkRead, onAction }) {
  const category = CATEGORY_META[notification.category] || CATEGORY_META.SYSTEM;
  const priority = PRIORITY_META[notification.priority] || PRIORITY_META.NORMAL;

  return (
    <div
      className={`flex gap-3 p-3 border-b last:border-b-0 cursor-pointer ${
        notification.isRead ? 'bg-white' : 'bg-blue-50'
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
    >
      <span
        className="w-2 h-2 mt-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: priority.color }}
        title={priority.label}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: category.color }}>
            {category.label}
          </span>
          <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{notification.title}</p>
        <p className="text-sm text-gray-600">{notification.body}</p>

        {notification.actions?.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.actions.map((action) => (
              <button
                key={action.action}
                type="button"
                className="text-xs font-medium px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(action, notification);
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
