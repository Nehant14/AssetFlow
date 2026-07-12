const express = require('express');
const router = express.Router();
const allocCtrl = require('./allocation.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');

router.use(protect);
router.post('/', restrictTo(['Admin', 'Asset_Manager']), allocCtrl.createAllocation);
router.post('/:id/return', restrictTo(['Admin', 'Asset_Manager']), allocCtrl.returnAsset);

module.exports = router;