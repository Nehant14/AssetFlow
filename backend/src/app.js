// backend/src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const orgRoutes = require('./modules/organization/organization.routes');
const assetRoutes = require('./modules/assets/asset.routes');
const allocRoutes = require('./modules/allocations/allocation.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const maintRoutes = require('./modules/maintenance/maintenance.routes');
const auditRoutes = require('./modules/audits/audit.routes');
const noticeRoutes = require('./modules/notifications/notification.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route (Add this back!)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'AssetFlow API is running smoothly' 
  });
});

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/notifications', noticeRoutes);

app.all('*', (req, res) => {
  res.status(404).json({ status: 'error', message: `Cannot find ${req.originalUrl}` });
});

// Central Error Middleware
app.use(errorHandler);

module.exports = app;