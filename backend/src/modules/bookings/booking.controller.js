const bookingService = require('./booking.service');
const prisma = require('../../config/db');

exports.bookResource = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({ ...req.body, userId: req.user.id });
    res.status(201).json({ status: 'success', data: booking });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({ include: { asset: true, bookedBy: true } });
  res.status(200).json({ status: 'success', data: bookings });
};