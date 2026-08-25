const express = require('express');
// Assumed to already exist per the project's middleware/ folder.
const { authenticate } = require('../middleware/authMiddleware');
const controller = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);
router.patch('/read-all', controller.markAllRead);

router.get('/preferences', controller.getPreferences);
router.put('/preferences', controller.updatePreferences);

router.post('/push-token', controller.registerPushToken);
router.delete('/push-token/:token', controller.removePushToken);

module.exports = router;

// --- Mount in backend/app.js -------------------------------------------
//   const notificationRoutes = require('./routes/notificationRoutes');
//   app.use('/api/notifications', notificationRoutes);
//
// --- Wire sockets + event handlers in backend/server.js -----------------
//   const http = require('http');
//   const app = require('./app');
//   const socketManager = require('./services/socket/socketManager');
//   const { initNotificationEventHandlers } = require('./services/notification/notificationEventHandlers');
//
//   const server = http.createServer(app);
//   socketManager.init(server);
//   initNotificationEventHandlers();
//   server.listen(process.env.PORT);
