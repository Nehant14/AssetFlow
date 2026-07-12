const prisma = require('../../config/db');

exports.createDepartment = async (req, res) => {
  try {
    const { name, headId, parentId } = req.body;
    const dept = await prisma.department.create({
      data: { name, headId: headId ? Number(headId) : null, parentId: parentId ? Number(parentId) : null }
    });
    if (headId) {
      await prisma.user.update({ where: { id: Number(headId) }, data: { role: 'DepartmentHead' } });
    }
    res.status(201).json({ status: 'success', data: dept });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getDepartments = async (req, res) => {
  const depts = await prisma.department.findMany({ include: { head: true, children: true } });
  res.status(200).json({ status: 'success', data: depts });
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, headId, parentId, status } = req.body;
    const dept = await prisma.department.update({
      where: { id: Number(id) },
      data: { name, headId: headId ? Number(headId) : null, parentId: parentId ? Number(parentId) : null, status }
    });
    res.status(200).json({ status: 'success', data: dept });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id: Number(id) } });
    res.status(200).json({ status: 'success', message: 'Department deleted.' });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};