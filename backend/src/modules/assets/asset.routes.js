const express = require('express');
const router = express.Router();
const assetCtrl = require('./asset.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');

router.use(protect);
router.post('/', restrictTo(['Admin', 'Asset_Manager']), assetCtrl.registerAsset);
router.get('/', assetCtrl.getAssets);

module.exports = router;