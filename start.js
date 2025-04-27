// Simple Startup Script for TrialSage
// This script handles launching both the server and the Vite dev environment

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting TrialSage...');

// Start the backend server
const server = spawn('node', ['server.js'], { 
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000'
  }
});

console.log('Server started on port 5000');

// Start the Vite frontend
const vite = spawn('npm', ['run', 'dev:client'], {
  stdio: 'inherit',
  cwd: path.join(__dirname)
});

console.log('Vite development server started');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill('SIGINT');
  vite.kill('SIGINT');
  process.exit(0);
});

// Handle child process errors
server.on('error', (err) => {
  console.error('Server process error:', err);
});

vite.on('error', (err) => {
  console.error('Vite process error:', err);
});

// Handle child process exits
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code !== 0 && code !== null) {
    console.error('Server crashed. Attempting to restart...');
    setTimeout(() => {
      const newServer = spawn('node', ['server.js'], { 
        stdio: 'inherit',
        env: {
          ...process.env,
          PORT: '5000'
        }
      });
      server = newServer;
    }, 1000);
  }
});

vite.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});