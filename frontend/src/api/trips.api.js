import axiosClient from './axiosClient';

// Handles Trip Management API calls[cite: 2]
export const getBookings = () => axiosClient.get('/trips');
export const createBooking = (tripData) => axiosClient.post('/trips', tripData);
export const cancelBooking = (id) => axiosClient.patch(`/trips/${id}/cancel`);
export const completeBooking = (id, finalData) => axiosClient.patch(`/trips/${id}/complete`, finalData);