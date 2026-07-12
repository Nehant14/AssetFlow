import axiosClient from './axiosClient';

// Backend exposes POST /api/auth/signup (not /register) — new accounts are
// always created with role "Employee"; elevation happens later via
// PATCH /api/org/employees/:id/role (Admin only).
export const login = (email, password) => {
  return axiosClient.post('/auth/login', { email, password });
};

export const signup = (userData) => {
  return axiosClient.post('/auth/signup', userData);
};
