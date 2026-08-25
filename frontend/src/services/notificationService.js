// Assumed to already exist per the project's services/ convention:
// a pre-configured axios instance with baseURL + auth header interceptor.
import api from '../utils/apiClient';

export const fetchNotifications = ({ category, isRead, page = 1, limit = 20 } = {}) =>
  api.get('/notifications', { params: { category, isRead, page, limit } }).then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get('/notifications/unread-count').then((r) => r.data.count);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

export const fetchNotificationPreferences = () =>
  api.get('/notifications/preferences').then((r) => r.data);

export const updateNotificationPreferences = (categories) =>
  api.put('/notifications/preferences', { categories }).then((r) => r.data);

export const registerPushToken = (token, platform) =>
  api.post('/notifications/push-token', { token, platform }).then((r) => r.data);
