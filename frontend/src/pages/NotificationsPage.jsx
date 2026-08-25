import { useEffect, useState } from 'react';
import { fetchNotifications } from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/Shared/Notifications/NotificationItem';
import { CATEGORY_META } from '../utils/notificationMeta';

const TABS = ['ALL', 'UNREAD'];

/**
 * Full notification inbox — paginated, filterable by category and read
 * status. NotificationBell/NotificationList only show a live preview
 * from context; this page fetches its own pages directly so it isn't
 * capped by whatever the context happens to be holding.
 */
export default function NotificationsPage({ onAction }) {
  const { markAsRead, markAllAsRead } = useNotifications();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState('ALL');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNotifications({
      page,
      limit: 20,
      isRead: tab === 'UNREAD' ? false : undefined,
      category: category || undefined,
    })
      .then((res) => {
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, tab, category]);

  useEffect(() => setPage(1), [tab, category]);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button type="button" className="text-sm text-blue-600 hover:underline" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className="flex gap-4 mb-4 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`pb-2 text-sm ${tab === t ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setTab(t)}
          >
            {t === 'ALL' ? 'All' : 'Unread'}
          </button>
        ))}

        <select
          className="ml-auto text-sm border rounded px-2 py-1 mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {Object.keys(CATEGORY_META).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {items.map((n) => (
          <NotificationItem key={n._id} notification={n} onMarkRead={markAsRead} onAction={onAction} />
        ))}
        {!loading && items.length === 0 && <p className="p-4 text-sm text-gray-500">No notifications here.</p>}
      </div>

      {items.length < total && (
        <button
          type="button"
          className="w-full mt-3 py-2 text-sm text-blue-600 border rounded hover:bg-gray-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
