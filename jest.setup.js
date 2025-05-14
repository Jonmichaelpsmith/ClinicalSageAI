// This file runs before Jest executes tests
require('dotenv').config();

// Set default timeout for all tests (10 seconds)
jest.setTimeout(10000);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // application specific handling code here
});

// Clean up resources after all tests
afterAll(async () => {
  // Add any cleanup code here if needed
  // For example, closing database connections
});