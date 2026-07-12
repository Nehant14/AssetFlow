const express = require('express');
const router = express.Router();
const maintCtrl = require('./maintenance.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');

router.use(protect);
router.get('/', maintCtrl.getMaintenanceRequests);
router.post('/', maintCtrl.raiseRequest);
router.patch('/:id/status', restrictTo(['Admin', 'AssetManager']), maintCtrl.updateStatus);

module.exports = router;