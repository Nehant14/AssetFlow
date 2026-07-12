const express = require('express');
const router = express.Router();
const assetCtrl = require('./asset.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');
 
router.use(protect);
router.post('/', restrictTo(['Admin', 'AssetManager']), assetCtrl.registerAsset);
router.get('/', assetCtrl.getAssets);
router.patch('/:id', restrictTo(['Admin', 'AssetManager']), assetCtrl.updateAsset);
router.delete('/:id', restrictTo(['Admin', 'AssetManager']), assetCtrl.deleteAsset);
 
module.exports = router;