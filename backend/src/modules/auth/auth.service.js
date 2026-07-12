// backend/src/modules/auth/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

async function signup({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Default role is always Employee per requirements
  return await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'Employee' },
    select: { id: true, name: true, email: true, role: true } // Fixed: id: true
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === 'Inactive') throw new Error('Invalid credentials or inactive account');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

module.exports = { signup, login };