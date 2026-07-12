const express = require('express');
const router = express.Router();
const deptCtrl = require('./department.controller');
const catCtrl = require('./category.controller');
const empCtrl = require('./employee.controller');
const protect = require('../../middlewares/auth.middleware');
const restrictTo = require('../../middlewares/rbac.middleware');

router.use(protect);

// Admin-only operations for Master Data[cite: 1]
router.post('/departments', restrictTo(['Admin']), deptCtrl.createDepartment);
router.get('/departments', deptCtrl.getDepartments);

router.post('/categories', restrictTo(['Admin']), catCtrl.createCategory);
router.get('/categories', catCtrl.getCategories);

router.get('/employees', empCtrl.getEmployees);
router.patch('/employees/:id/role', restrictTo(['Admin']), empCtrl.updateEmployeeRole);

module.exports = router;