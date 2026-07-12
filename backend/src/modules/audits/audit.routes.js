const express = require('express');
const router = express.Router();
const auditCtrl = require('./audit.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');

router.use(protect);
router.post('/cycles', restrictTo(['Admin']), auditCtrl.createCycle);
router.post('/verify', auditCtrl.recordVerification);
router.patch('/cycles/:id/close', restrictTo(['Admin']), auditCtrl.closeCycle);

module.exports = router;