// Simple starter script for the TrialSage application using ES modules
// This script will run the optimized server instead of the TypeScript server

console.log('Starting TrialSage with optimized server...');

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if the optimized server exists
const serverPath = join(__dirname, 'optimized-server.mjs');
if (!fs.existsSync(serverPath)) {
  console.error('Error: optimized-server.mjs not found');
  process.exit(1);
}

// Start the optimized server
const server = spawn('node', [serverPath], {
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