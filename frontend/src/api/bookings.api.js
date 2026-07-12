import axiosClient from './axiosClient';

// GET /api/bookings — returns bookings with asset + bookedBy included
export const getBookings = () => {
  return axiosClient.get('/bookings');
};

// POST /api/bookings — userId is attached server-side from the auth token
// body: { assetId, startTime, endTime }
export const createBooking = (bookingData) => {
  return axiosClient.post('/bookings', bookingData);
};
