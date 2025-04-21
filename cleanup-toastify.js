/**
 * This script permanently removes react-toastify remnants from node_modules
 * and clears related Vite cache to prevent dependency optimization errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to delete a directory and all its contents recursively
function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
    console.log(`Deleted: ${directoryPath}`);
  }
}

// Clean up react-toastify module if it exists
const toastifyPath = path.join(__dirname, 'node_modules', 'react-toastify');
if (fs.existsSync(toastifyPath)) {
  console.log('Found react-toastify in node_modules, removing...');
  deleteFolderRecursive(toastifyPath);
} else {
  console.log('react-toastify not found in node_modules (good!)');
}

// Clean Vite cache to prevent optimization errors
const viteCachePath = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCachePath)) {
  console.log('Clearing Vite cache...');
  deleteFolderRecursive(viteCachePath);
} else {
  console.log('Vite cache not found or already cleared');
}

console.log('Toast dependency cleanup complete!');