// backend/server.js

require('dotenv').config();

const http = require('http');
const app = require('./app');

const {
  initializeNotificationSocket,
} = require('./services/notificationSocket');

const port = process.env.PORT || 5000;

const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

initializeNotificationSocket(io);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});