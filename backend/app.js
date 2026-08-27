// backend/app.js

const express = require('express');

const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(express.json());

app.use(
  '/api/v1/notifications',
  notificationRoutes,
);

module.exports = app;