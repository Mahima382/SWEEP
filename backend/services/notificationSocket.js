// backend/services/notificationSocket.js

let io;

const connectedUsers = new Map();

function initializeNotificationSocket(socketServer) {
  io = socketServer;

  io.on('connection', (socket) => {
    socket.on('notification:register', (userId) => {
      if (!userId) { return; }

      const id = String(userId);

      if (!connectedUsers.has(id)) {
        connectedUsers.set(id, new Set());
      }

      connectedUsers.get(id).add(socket.id);

      const connectedSocket = socket;
      connectedSocket.userId = userId;
    });

    socket.on('disconnect', () => {
      const { userId } = socket.data;

      if (!userId) { return; }

      const sockets = connectedUsers.get(userId);

      if (!sockets) { return; }

      sockets.delete(socket.id);

      if (sockets.size === 0) {
        connectedUsers.delete(userId);
      }
    });
  });
}

function emitToUser(userId, notification) {
  if (!io) { return; }

  const sockets = connectedUsers.get(String(userId));

  if (!sockets) { return; }

  sockets.forEach((socketId) => {
    io.to(socketId).emit('notification:new', notification);
  });
}

function emitReadStatus(userId, notificationId) {
  if (!io) { return; }

  const sockets = connectedUsers.get(String(userId));

  if (!sockets) { return; }

  sockets.forEach((socketId) => {
    io.to(socketId).emit('notification:read', {
      notificationId,
    });
  });
}

function emitAllReadStatus(userId) {
  if (!io) { return; }

  const sockets = connectedUsers.get(String(userId));

  if (!sockets) { return; }

  sockets.forEach((socketId) => {
    io.to(socketId).emit('notification:all-read');
  });
}

module.exports = {
  initializeNotificationSocket,
  emitToUser,
  emitReadStatus,
  emitAllReadStatus,
};