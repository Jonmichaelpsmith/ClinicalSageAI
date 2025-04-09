// Import v2 data test script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importTrialsFromApiV2 } from '../data-importer.js';

// Get current directory name (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImport() {
  try {
    // Find the most recent data file
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      console.error('Data directory not found');
      return;
    }
    
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(dataDir, file),
        ctime: fs.statSync(path.join(dataDir, file)).ctime.getTime()
      }))
      .sort((a, b) => b.ctime - a.ctime);
    
    if (files.length === 0) {
      console.error('No data files found');
      return;
    }
    
    const latestFile = files[0].path;
    console.log(`Using latest data file: ${latestFile}`);
    
    // Read the data
    const fileContent = fs.readFileSync(latestFile, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Import the data
    console.log('Importing data...');
    const result = await importTrialsFromApiV2(data);
    console.log('Import result:', result);
    
  } catch (error) {
    console.error('Error in testImport:', error);
  }
}

// Run the test
testImport();