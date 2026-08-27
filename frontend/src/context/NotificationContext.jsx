// frontend/src/context/NotificationContext.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { io } from 'socket.io-client';

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';

const NotificationContext =
  createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

export function NotificationProvider({
  userId,
  children,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const loadNotifications = useCallback(
    async () => {
      if (!userId) return;

      const response =
        await getNotifications();

      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit(
        'notification:register',
        userId
      );
    });

    socket.on(
      'notification:new',
      (notification) => {
        setNotifications((current) => [
          notification,
          ...current,
        ]);

        setUnreadCount((current) => current + 1);
      }
    );

    socket.on(
      'notification:read',
      ({ notificationId }) => {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
          )
        );

        setUnreadCount((current) =>
          Math.max(current - 1, 0)
        );
      }
    );

    socket.on(
      'notification:all-read',
      () => {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            is_read: true,
          }))
        );

        setUnreadCount(0);
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId) => {
      await markNotificationAsRead(
        notificationId
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0)
      );
    },
    []
  );

  const markAllAsRead = useCallback(
    async () => {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    },
    []
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider'
    );
  }

  return context;
}