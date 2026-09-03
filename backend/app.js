// backend/app.js

const express = require('express');

const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(express.json());

// Service health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'sweep-backend' });
});

// Placeholder route for FR-03
app.get('/api/waste/listings', (req, res) => {
  res.status(501).json({ message: 'FR-03 not implemented' });
});

// Domain API routes
app.use(
  '/api/v1/notifications',
  notificationRoutes,
);

app.use(
  '/api/v1/payments',
  paymentRoutes,
);

module.exports = app;