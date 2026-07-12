// backend/src/config/db.js

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;