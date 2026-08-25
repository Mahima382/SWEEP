import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';

export const NotificationContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

/**
 * Holds the live notification list + unread count for the current user
 * and keeps both in sync with the server in real time over Socket.IO.
 * Wrap the authenticated part of the app with this provider once,
 * passing the current session's auth token.
 */
export function NotificationProvider({ children, authToken }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [{ items }, count] = await Promise.all([
        fetchNotifications({ page: 1, limit: 20 }),
        fetchUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return undefined;

    loadInitial();

    const socket = io(SOCKET_URL, { auth: { token: authToken } });
    socketRef.current = socket;

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [authToken, loadInitial]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadInitial,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
