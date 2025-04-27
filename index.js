// Bootstrap file for the TrialSage application
import { spawn } from 'child_process';

console.log('Starting TrialSage application...');

// Run the Express server
const serverProcess = spawn('node', ['server-express.js']);

serverProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});