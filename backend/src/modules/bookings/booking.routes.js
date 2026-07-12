const express = require('express');
const router = express.Router();
const bookingCtrl = require('./booking.controller');
const protect = require('../../middlewares/auth.middleware');

router.use(protect);
router.post('/', bookingCtrl.bookResource);
router.get('/', bookingCtrl.getBookings);
router.patch('/:id', bookingCtrl.updateBooking);
router.delete('/:id', bookingCtrl.cancelBooking);

module.exports = router;