const prisma = require('../../config/db');

exports.createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body; // e.g. customFields: { warrantyPeriod: "2 years" }[cite: 1]
    const cat = await prisma.assetCategory.create({ data: { name, customFields } });
    res.status(201).json({ status: 'success', data: cat });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getCategories = async (req, res) => {
  const cats = await prisma.assetCategory.findMany();
  res.status(200).json({ status: 'success', data: cats });
};