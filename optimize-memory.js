/**
 * Memory Optimization Configuration for TrialSage
 * 
 * This script modifies the .replit file to adjust memory settings and resource allocation
 * to avoid exhaustion in memory-constrained environments.
 */

import fs from 'fs';

// Read current .replit file
const replitFile = './.replit';
let replitContent = '';

try {
  if (fs.existsSync(replitFile)) {
    replitContent = fs.readFileSync(replitFile, 'utf8');
    console.log('Found .replit configuration file');
  } else {
    console.log('No .replit file found, creating new one');
    replitContent = '[nix]\nchannel = "stable-22_11"\n\n[env]\nNODE_OPTIONS = "--max-old-space-size=512"\n';
  }
} catch (err) {
  console.error('Error reading .replit file:', err);
  process.exit(1);
}

// Check if NODE_OPTIONS is already in the file
if (!replitContent.includes('NODE_OPTIONS')) {
  // Add NODE_OPTIONS to limit memory usage
  if (replitContent.includes('[env]')) {
    // Add to existing [env] section
    replitContent = replitContent.replace(
      /\[env\]([\s\S]*?)(\n\[|\n$)/,
      '[env]$1NODE_OPTIONS = "--max-old-space-size=512"\n$2'
    );
  } else {
    // Add new [env] section
    replitContent += '\n[env]\nNODE_OPTIONS = "--max-old-space-size=512"\n';
  }
  
  console.log('Added memory optimization settings');
} else {
  // Update existing NODE_OPTIONS
  replitContent = replitContent.replace(
    /NODE_OPTIONS\s*=\s*"([^"]*)"/,
    'NODE_OPTIONS = "--max-old-space-size=512"'
  );
  
  console.log('Updated memory optimization settings');
}

// Write the updated config back
try {
  fs.writeFileSync(replitFile, replitContent);
  console.log('Successfully updated .replit configuration with memory optimizations');
} catch (err) {
  console.error('Error writing .replit file:', err);
  process.exit(1);
}

// Also create a startup script with optimized settings
const startScript = `#!/bin/bash
# Memory-optimized start script for TrialSage
# This addresses the "pthread_create: Resource temporarily unavailable" error

# Reduce thread pool size
export UV_THREADPOOL_SIZE=4

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=512 --trace-warnings"

# Run the application
echo "Starting application with memory optimizations..."
node cleanup-toastify.js && tsx --inspect server/index.ts
`;

try {
  fs.writeFileSync('./start-optimized.sh', startScript);
  fs.chmodSync('./start-optimized.sh', 0o755); // Make executable
  console.log('Created optimized startup script: start-optimized.sh');
} catch (err) {
  console.error('Error creating start script:', err);
}

console.log('\nMemory optimization complete!');
console.log('To start the application with these optimizations, run:');
console.log('  ./start-optimized.sh');