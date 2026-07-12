const prisma = require('../../config/db');

exports.getEmployees = async (req, res) => {
  const employees = await prisma.user.findMany({ include: { department: true } });
  res.status(200).json({ status: 'success', data: employees });
};

// Main point for elevating roles[cite: 1]
exports.updateEmployeeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, departmentId, status } = req.body;
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role, departmentId, status }
    });
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};