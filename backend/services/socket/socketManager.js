const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

/**
 * Singleton wrapper around the Socket.IO server (Singleton pattern —
 * exactly one io instance for the process). Every authenticated socket
 * joins a room named `user:<userId>`, so delivering a real-time
 * notification anywhere else in the app is just
 * `socketManager.emitToUser(userId, event, payload)` — no manual
 * connection bookkeeping required.
 */
class SocketManager {
  constructor() {
    this.io = null;
  }

  /**
 * Initializes the Socket.IO server.
 *
 * Call once from backend/server.js after the HTTP server is created.
 *
 * @param {Object} httpServer - HTTP server instance.
 * @returns {Object} Socket.IO server instance.
 */
  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: { origin: process.env.CLIENT_ORIGIN || '*', credentials: true },
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.id;
        next();
      } catch (err) {
        next(new Error('Unauthorized socket connection'));
      }
    });

    this.io.on('connection', (socket) => {
      socket.join(`user:${socket.userId}`);
      // Multi-device sync: read/write state lives in Mongo, not on the
      // socket, so every open tab/device for this user converges
      // automatically as soon as it's in this room.
    });

    return this.io;
  }

  isUserOnline(userId) {
    if (!this.io) return false;
    const room = this.io.sockets.adapter.rooms.get(`user:${userId}`);
    return Boolean(room && room.size > 0);
  }

  emitToUser(userId, event, payload) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, payload);
  }
}

// Singleton — must be shared across the whole process, not per-request.
module.exports = new SocketManager();
