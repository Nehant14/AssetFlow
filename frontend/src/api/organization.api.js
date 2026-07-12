import axiosClient from './axiosClient';

export const getDepartments = () => axiosClient.get('/org/departments');
export const createDepartment = (data) => axiosClient.post('/org/departments', data);
export const updateDepartment = (id, data) => axiosClient.patch(`/org/departments/${id}`, data);
export const deleteDepartment = (id) => axiosClient.delete(`/org/departments/${id}`);

export const getCategories = () => axiosClient.get('/org/categories');
export const createCategory = (data) => axiosClient.post('/org/categories', data);
export const updateCategory = (id, data) => axiosClient.patch(`/org/categories/${id}`, data);
export const deleteCategory = (id) => axiosClient.delete(`/org/categories/${id}`);

export const getEmployees = () => axiosClient.get('/org/employees');
export const updateEmployeeRole = (id, data) => axiosClient.patch(`/org/employees/${id}/role`, data);
