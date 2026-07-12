import axiosClient from './axiosClient';

// Implement secure login using email and password[cite: 2]
export const login = (email, password) => {
  return axiosClient.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return axiosClient.post('/auth/register', userData);
};