/* eslint-disable import/no-unresolved, import/extensions */
/**
 * Core Unit Tests for Notification Feature (FR-09).
 *
 * Streamlined test suite focused on essential demonstration functionality:
 * 1. Notification Creation & Domain Helpers (Pickup, Order, Payment)
 * 2. Real-Time WebSocket Delivery (User Socket Registration & Broadcasts)
 * 3. Notification Persistence & Read-State Management (Mark As Read, Unread Count)
 * 4. Notification Controller API Endpoints (Live In-App Notification Flow)
 */

const notificationService = require('../../services/notificationService');
const notificationSocket = require('../../services/notificationSocket');
const Notification = require('../../models/Notification');
const notificationController = require('../../controllers/notificationController');
const pool = require('../../config/db');

describe('Notification Feature — Core Demonstration Tests', () => {
  let mockIo;
  let connectionHandler;

  /**
   * Helper to simulate a user connecting to Socket.IO.
   *
   * @param {number|string} userId - User identifier.
   * @param {string} socketId - Simulated socket ID.
   * @returns {object} Mock socket and listener map.
   */
  const setupMockUserSocket = (userId, socketId = `socket-${userId}`) => {
    const socketListeners = {};
    const mockSocket = {
      id: socketId,
      on: vi.fn((event, fn) => {
        socketListeners[event] = fn;
      }),
      data: {},
    };

    if (connectionHandler) {
      connectionHandler(mockSocket);
      if (socketListeners['notification:register']) {
        socketListeners['notification:register'](userId);
      }
    }

    return { mockSocket, socketListeners };
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    mockIo = {
      on: vi.fn((event, handler) => {
        if (event === 'connection') {
          connectionHandler = handler;
        }
      }),
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    notificationSocket.initializeNotificationSocket(mockIo);
  });

  // =========================================================================
  // 1. Notification Creation & Live Dispatch
  // =========================================================================
  describe('1. Notification Creation & Live Dispatch', () => {
    it('creates a notification and emits it in real-time via WebSocket', async () => {
      const mockCreated = {
        id: 1,
        recipient_id: 10,
        type: 'Pickup',
        priority: 'Normal',
        title: 'Pickup Scheduled',
        message: 'A local collector has been assigned.',
      };

      vi.spyOn(Notification, 'create').mockResolvedValue(mockCreated);
      setupMockUserSocket(10, 'socket-user-10');

      const result = await notificationService.create({
        recipientId: 10,
        type: 'Pickup',
        title: 'Pickup Scheduled',
        message: 'A local collector has been assigned.',
      });

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 10,
          type: 'Pickup',
          title: 'Pickup Scheduled',
        }),
      );
      expect(mockIo.to).toHaveBeenCalledWith('socket-user-10');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:new', mockCreated);
      expect(result).toEqual(mockCreated);
    });

    it('creates domain-specific notifications with correct category and references', async () => {
      const createSpy = vi.spyOn(notificationService, 'create').mockResolvedValue({});

      // Pickup notification
      await notificationService.pickup({
        recipientId: 10,
        title: 'Collector Arrived',
        message: 'Collector is waiting at your gate.',
        pickupId: 501,
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 10,
          type: 'Pickup',
          priority: 'Important',
          referenceType: 'pickup',
          referenceId: 501,
        }),
      );

      // Order notification
      await notificationService.order({
        recipientId: 20,
        title: 'Order Confirmed',
        message: 'Recycling company confirmed order #302.',
        orderId: 302,
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 20,
          type: 'Order',
          referenceType: 'order',
          referenceId: 302,
        }),
      );

      // Payment notification
      await notificationService.payment({
        recipientId: 30,
        title: 'Payment Received',
        message: 'Received 800 BDT for waste lot.',
        transactionId: 9001,
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 30,
          type: 'Payment',
          referenceType: 'transaction',
          referenceId: 9001,
        }),
      );
    });
  });

  // =========================================================================
  // 2. Real-Time WebSocket Communication
  // =========================================================================
  describe('2. Real-Time WebSocket Communication', () => {
    it('registers a connected user and routes live notifications to their active socket', () => {
      setupMockUserSocket(100, 'socket-100');

      const notification = { id: 5, title: 'Live Update' };
      notificationSocket.emitToUser(100, notification);

      expect(mockIo.to).toHaveBeenCalledWith('socket-100');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:new', notification);
    });

    it('broadcasts read and all-read updates to connected user sockets', () => {
      setupMockUserSocket(100, 'socket-100');

      // Single notification read update
      notificationSocket.emitReadStatus(100, 42);
      expect(mockIo.to).toHaveBeenCalledWith('socket-100');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:read', { notificationId: 42 });

      // All notifications read update
      notificationSocket.emitAllReadStatus(100);
      expect(mockIo.to).toHaveBeenCalledWith('socket-100');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:all-read');
    });

    it('handles offline users gracefully without throwing', () => {
      expect(() => {
        notificationSocket.emitToUser(9999, { title: 'No-op' });
        notificationSocket.emitReadStatus(9999, 1);
        notificationSocket.emitAllReadStatus(9999);
      }).not.toThrow();

      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. Persistence & Read Status Tracking (Database Model)
  // =========================================================================
  describe('3. Persistence & Read Status Tracking', () => {
    it('queries user notifications with pagination and unread counts', async () => {
      const mockRows = [
        { id: 1, title: 'Item 1', is_read: false },
        { id: 2, title: 'Item 2', is_read: true },
      ];

      vi.spyOn(pool, 'execute')
        .mockResolvedValueOnce([mockRows])
        .mockResolvedValueOnce([[{ unreadCount: 1 }]]);

      const items = await Notification.findByUser(5, { limit: 10, offset: 0 });
      const unreadCount = await Notification.countUnread(5);

      expect(items).toEqual(mockRows);
      expect(unreadCount).toBe(1);
    });

    it('marks a single notification as read in database', async () => {
      vi.spyOn(pool, 'execute').mockResolvedValue([{ affectedRows: 1 }]);

      const updated = await Notification.markAsRead(10, 1);

      expect(updated).toBe(true);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [10, 1],
      );
    });

    it('marks all unread notifications as read for a user', async () => {
      vi.spyOn(pool, 'execute').mockResolvedValue([{ affectedRows: 4 }]);

      const count = await Notification.markAllAsRead(1);

      expect(count).toBe(4);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_read = FALSE'),
        [1],
      );
    });
  });

  // =========================================================================
  // 4. Notification Controller (API Endpoints)
  // =========================================================================
  describe('4. Notification Controller API Endpoints', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        user: { id: 100 },
        query: {},
        params: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
    });

    it('getNotifications returns user notifications list and unread count', async () => {
      const mockList = [{ id: 1, title: 'Test Alert', is_read: false }];

      vi.spyOn(Notification, 'findByUser').mockResolvedValue(mockList);
      vi.spyOn(Notification, 'countUnread').mockResolvedValue(1);

      await notificationController.getNotifications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockList,
        unreadCount: 1,
      });
    });

    it('markAsRead marks notification as read and emits live status update', async () => {
      mockReq.params.id = '42';
      vi.spyOn(Notification, 'markAsRead').mockResolvedValue(true);
      setupMockUserSocket(100, 'socket-100');

      await notificationController.markAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockIo.to).toHaveBeenCalledWith('socket-100');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:read', { notificationId: 42 });
    });

    it('markAllAsRead marks all as read and broadcasts to client over WebSocket', async () => {
      vi.spyOn(Notification, 'markAllAsRead').mockResolvedValue(3);
      setupMockUserSocket(100, 'socket-100');

      await notificationController.markAllAsRead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockIo.to).toHaveBeenCalledWith('socket-100');
      expect(mockIo.emit).toHaveBeenCalledWith('notification:all-read');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read',
        updated: 3,
      });
    });
  });
});
