import axiosClient from './axiosClient';

export const getBookings = () => axiosClient.get('/bookings');
export const createBooking = (bookingData) => axiosClient.post('/bookings', bookingData);
export const updateBooking = (id, bookingData) => axiosClient.patch(`/bookings/${id}`, bookingData);
export const cancelBooking = (id) => axiosClient.delete(`/bookings/${id}`);
