// backend/src/server.js

require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server
const server = app.listen(PORT, HOST, async () => {
  try {
    // Test the database connection on startup
    await prisma.$connect();
    console.log('Successfully connected to the database.');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections (e.g., unexpected DB disconnections)
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.log('Shutting down the server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});