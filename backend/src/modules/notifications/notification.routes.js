const express = require('express');
const router = express.Router();
const notifyCtrl = require('./notification.controller');
const protect = require('../../middlewares/auth.middleware');

router.get('/dashboard-kpis', protect, notifyCtrl.getDashboardKPIs);

module.exports = router;