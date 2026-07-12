const bookingService = require('./booking.service');
const prisma = require('../../config/db');

exports.bookResource = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({ ...req.body, userId: req.user.id });
    await prisma.notification.create({
      data: { userId: req.user.id, message: `Booking created for asset ${booking.assetId}.` }
    });
    res.status(201).json({ status: 'success', data: booking });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getBookings = async (req, res) => {
  const where = req.user.role === 'Admin' || req.user.role === 'AssetManager' ? {} : { bookedById: req.user.id };
  const bookings = await prisma.booking.findMany({ where, include: { asset: true, bookedBy: true } });
  res.status(200).json({ status: 'success', data: bookings });
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.body, req.user.id, req.user.role === 'Admin');
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role === 'Admin');
    await prisma.notification.create({ data: { userId: req.user.id, message: 'Booking cancelled.' } });
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};