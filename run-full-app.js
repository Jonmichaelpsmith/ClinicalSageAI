/**
 * TrialSage Full Application Launcher
 * This script starts the complete TrialSage application using the index.ts file
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// First, run the cleanup script
console.log('Running cleanup script...');
require('./cleanup-toastify');

// Then start the full application
console.log('Starting full TrialSage application...');
const fullApp = spawn('tsx', ['--inspect', 'server/index.ts'], {
  env: { ...process.env, NODE_OPTIONS: '--trace-warnings' },
  stdio: 'inherit'
});

fullApp.on('error', (err) => {
  console.error('Failed to start full application:', err);
});

process.on('SIGINT', () => {
  console.log('Shutting down TrialSage application...');
  fullApp.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down TrialSage application...');
  fullApp.kill('SIGTERM');
});