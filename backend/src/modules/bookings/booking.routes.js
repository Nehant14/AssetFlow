const express = require('express');
const router = express.Router();
const bookingCtrl = require('./booking.controller');
const protect = require('../../middlewares/auth.middleware');

router.use(protect);
router.post('/', bookingCtrl.bookResource);
router.get('/', bookingCtrl.getBookings);

module.exports = router;