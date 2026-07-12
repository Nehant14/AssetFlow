import axiosClient from './axiosClient';

// Departments
export const getDepartments = () => axiosClient.get('/org/departments');
// POST (Admin only) — body: { name, headId, parentId }
export const createDepartment = (data) => axiosClient.post('/org/departments', data);

// Categories
export const getCategories = () => axiosClient.get('/org/categories');
// POST (Admin only) — body: { name, customFields }
export const createCategory = (data) => axiosClient.post('/org/categories', data);

// Employees
export const getEmployees = () => axiosClient.get('/org/employees');
// PATCH (Admin only) — body: { role, departmentId, status }
export const updateEmployeeRole = (id, data) => axiosClient.patch(`/org/employees/${id}/role`, data);
