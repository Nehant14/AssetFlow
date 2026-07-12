import axiosClient from './axiosClient';

// 3.8 Reports & Analytics
// Expected shape per vehicle: {
//   vehicleId, registrationNumber, distance, fuelUsed, fuelCost,
//   maintenanceCost, revenue, acquisitionCost
// }
export const getVehicleReports = () => axiosClient.get('/reports/vehicles');
export const getFleetUtilization = () => axiosClient.get('/reports/utilization');
