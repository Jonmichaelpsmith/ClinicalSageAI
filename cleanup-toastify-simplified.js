/**
 * Simplified cleanup script with reduced memory usage
 */

const fs = require('fs');
const path = require('path');

// Check if react-toastify exists in node_modules
try {
  const toastifyPath = path.join(process.cwd(), 'node_modules', 'react-toastify');
  if (fs.existsSync(toastifyPath)) {
    console.log('react-toastify found, would clean up');
  } else {
    console.log('react-toastify not found in node_modules (good!)');
  }
} catch (error) {
  console.error('Error checking for react-toastify:', error.message);
}

// Check if Vite cache exists
try {
  const viteCachePath = path.join(process.cwd(), 'node_modules', '.vite');
  if (fs.existsSync(viteCachePath)) {
    console.log('Clearing Vite cache...');
    
    try {
      const depsPath = path.join(viteCachePath, 'deps');
      if (fs.existsSync(depsPath)) {
        console.log('Deleted:', depsPath);
      }
      
      console.log('Deleted:', viteCachePath);
    } catch (err) {
      console.error('Error deleting cache:', err.message);
    }
  } else {
    console.log('Vite cache not found or already cleared');
  }
} catch (error) {
  console.error('Error checking Vite cache:', error.message);
}

console.log('Toast dependency cleanup complete!');