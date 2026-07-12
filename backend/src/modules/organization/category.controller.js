const prisma = require('../../config/db');

exports.createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    const existing = await prisma.category.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    if (existing) return res.status(409).json({ status: 'error', message: 'Category already exists.' });

    const cat = await prisma.category.create({ data: { name, customFields } });
    res.status(201).json({ status: 'success', data: cat });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getCategories = async (req, res) => {
  const cats = await prisma.category.findMany();
  res.status(200).json({ status: 'success', data: cats });
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customFields } = req.body;
    const cat = await prisma.category.update({ where: { id: Number(id) }, data: { name, customFields } });
    res.status(200).json({ status: 'success', data: cat });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    res.status(200).json({ status: 'success', message: 'Category deleted.' });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};