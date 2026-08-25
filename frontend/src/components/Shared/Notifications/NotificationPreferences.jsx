import { useEffect, useState } from 'react';
import { fetchNotificationPreferences, updateNotificationPreferences } from '../../../services/notificationService';
import { CATEGORY_META } from '../../../utils/notificationMeta';

const CHANNELS = ['inApp', 'push', 'email'];

export default function NotificationPreferences() {
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotificationPreferences().then((pref) => setCategories(pref.categories || []));
  }, []);

  const getPref = (category) =>
    categories.find((c) => c.category === category) || {
      category,
      inApp: true,
      push: true,
      email: false,
      muted: false,
    };

  const updateCategory = (category, field, value) => {
    setCategories((prev) => {
      const existing = prev.find((c) => c.category === category);
      const updated = { ...(existing || getPref(category)), [field]: value };
      return existing ? prev.map((c) => (c.category === category ? updated : c)) : [...prev, updated];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(categories);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Category</th>
            {CHANNELS.map((c) => (
              <th key={c} className="py-2 capitalize">
                {c}
              </th>
            ))}
            <th className="py-2">Mute</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(CATEGORY_META).map((categoryKey) => {
            const pref = getPref(categoryKey);
            return (
              <tr key={categoryKey} className="border-t">
                <td className="py-2">{CATEGORY_META[categoryKey].label}</td>
                {CHANNELS.map((channel) => (
                  <td key={channel} className="py-2">
                    <input
                      type="checkbox"
                      checked={pref[channel]}
                      onChange={(e) => updateCategory(categoryKey, channel, e.target.checked)}
                    />
                  </td>
                ))}
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={pref.muted}
                    onChange={(e) => updateCategory(categoryKey, 'muted', e.target.checked)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-xs text-gray-400 mt-2">
        Security alerts and critical account notifications are always delivered, even if muted here.
      </p>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  );
}
