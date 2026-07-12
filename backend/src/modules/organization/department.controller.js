const prisma = require('../../config/db');

exports.createDepartment = async (req, res) => {
  try {
    const { name, headId, parentId } = req.body;
    const dept = await prisma.department.create({
      data: { name, headId, parentId }
    });
    // If promoted head, adjust user model role to Department_Head
    if (headId) {
      await prisma.user.update({ where: { id: headId }, data: { role: 'Department_Head' } });
    }
    res.status(201).json({ status: 'success', data: dept });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getDepartments = async (req, res) => {
  const depts = await prisma.department.findMany({ include: { head: true, children: true } });
  res.status(200).json({ status: 'success', data: depts });
};