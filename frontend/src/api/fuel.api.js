import axiosClient from './axiosClient';

// 3.7 Fuel & Expense Management
// Fuel logs: liters, cost, date, tied to a vehicle/trip
export const getFuelLogs = (vehicleId) => {
  const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
  return axiosClient.get(`/fuel-logs${query}`);
};

export const createFuelLog = (logData) => {
  return axiosClient.post('/fuel-logs', logData);
};

// Other expenses: tolls, misc costs, etc.
export const getExpenses = (vehicleId) => {
  const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
  return axiosClient.get(`/expenses${query}`);
};

export const createExpense = (expenseData) => {
  return axiosClient.post('/expenses', expenseData);
};
