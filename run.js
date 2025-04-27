// Simple starter script for the TrialSage application
// This script will run the optimized server instead of the TypeScript server

console.log('Starting TrialSage with optimized server...');

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if the optimized server exists
if (!fs.existsSync('./optimized-server.js')) {
  console.error('Error: optimized-server.js not found');
  process.exit(1);
}

// Start the optimized server
const server = spawn('node', ['optimized-server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000'
  }
});

console.log('Server process started with PID:', server.pid);

// Handle process termination
process.on('SIGINT', () => {
  console.log('SIGINT received, terminating server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, terminating server...');
  server.kill('SIGTERM');
});

// Handle child process errors
server.on('error', (err) => {
  console.error('Server process error:', err);
  process.exit(1);
});

// Handle child process exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});