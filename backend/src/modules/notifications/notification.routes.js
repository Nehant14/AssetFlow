const express = require('express');
const router = express.Router();
const notifyCtrl = require('./notification.controller');
const protect = require('../../middlewares/auth.middleware');

router.use(protect);
router.get('/', notifyCtrl.getNotifications);
router.patch('/:id/read', notifyCtrl.markNotificationRead);
router.get('/dashboard-kpis', notifyCtrl.getDashboardKPIs);

module.exports = router;