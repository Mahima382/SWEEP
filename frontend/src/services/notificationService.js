// frontend/src/services/notificationService.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function request(url, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Notification request failed'
    );
  }

  return data;
}

export async function getNotifications({
  limit = 20,
  offset = 0,
  unreadOnly = false,
} = {}) {
  return request(
    `/notifications?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`
  );
}

export async function getUnreadCount() {
  return request('/notifications/unread-count');
}

export async function markNotificationAsRead(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead() {
  return request('/notifications/read-all', {
    method: 'PATCH',
  });
}