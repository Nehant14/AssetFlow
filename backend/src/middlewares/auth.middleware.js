const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { department: true }
    });

    if (!user || user.status === 'Inactive') {
      return res.status(401).json({ status: 'error', message: 'User not found or account deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};