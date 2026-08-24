/**
 * SWEEP Express application (Controller layer entry).
 *
 * Configures middleware, mounts all /api/* route modules, and registers
 * the 404 + central error handlers. Exports the app without listening,
 * so tests can drive it with supertest.
 */

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const wasteRoutes = require('./routes/waste.routes');
const walletRoutes = require('./routes/wallet.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const userManagementRoutes = require('./routes/UserManagementRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'sweep-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userManagementRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;
