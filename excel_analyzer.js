/**
 * Excel Analyzer for eCTD Machine Blueprint
 * 
 * This script attempts to extract information from the client-provided Excel file
 * using various approaches since we're having installation issues with xlsx libraries.
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import { exec as execCallback } from 'child_process';
import { fileURLToPath } from 'url';

const exec = util.promisify(execCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, 'attached_assets', 'dream eCTD machine 2.xlsx');

// Check if the file exists
function checkFile() {
  console.log(`\nChecking file: ${EXCEL_FILE_PATH}`);
  
  try {
    const stats = fs.statSync(EXCEL_FILE_PATH);
    console.log(`File exists: ${stats.size} bytes`);
    return true;
  } catch (error) {
    console.error(`Error accessing file: ${error.message}`);
    return false;
  }
}

// Get basic file information
async function getBasicFileInfo() {
  console.log('\nGetting basic file info...');
  
  try {
    const { stdout: fileOutput } = await exec(`file "${EXCEL_FILE_PATH}"`);
    console.log(`File type: ${fileOutput.trim()}`);
    
    const { stdout: stringsOutput } = await exec(`strings "${EXCEL_FILE_PATH}" | grep -i "IND\\|eCTD\\|workflow\\|module" | head -30`);
    
    console.log('\nRelevant strings found in file:');
    if (stringsOutput.trim()) {
      console.log(stringsOutput);
    } else {
      console.log('No relevant strings found with grep search.');
    }
    
    // Try to extract sheet names
    try {
      const { stdout: unzipOutput } = await exec(`unzip -l "${EXCEL_FILE_PATH}" | grep "sheet"`);
      console.log('\nSheet information:');
      console.log(unzipOutput);
    } catch (err) {
      console.log('Could not extract sheet names with unzip.');
    }
    
    return true;
  } catch (error) {
    console.error(`Error getting file info: ${error.message}`);
    return false;
  }
}

// Try to extract XML content from the Excel file
async function extractXmlContent() {
  console.log('\nAttempting to extract XML content...');
  
  try {
    // Create a temp directory for extraction
    const tempDir = path.join(__dirname, 'temp_excel_extract');
    await exec(`mkdir -p "${tempDir}"`);
    
    // Copy the file to ensure we don't damage the original
    const tempFile = path.join(tempDir, 'temp.xlsx');
    await exec(`cp "${EXCEL_FILE_PATH}" "${tempFile}"`);
    
    // Unzip the Excel file (which is actually a zip archive of XML files)
    await exec(`cd "${tempDir}" && unzip -q "${tempFile}"`);
    
    // Look for worksheet content
    const { stdout: findOutput } = await exec(`find "${tempDir}" -name "sheet*.xml" | head -1`);
    const sheetFile = findOutput.trim();
    
    if (sheetFile) {
      console.log(`Found sheet XML: ${sheetFile}`);
      
      // Extract basic content
      const { stdout: xmlContent } = await exec(`cat "${sheetFile}" | grep -o "<v>[^<]*</v>" | sed 's/<v>\\(.*\\)<\\/v>/\\1/' | head -50`);
      
      console.log('\nExtracted cell values:');
      console.log(xmlContent || 'No values found in the expected format.');
      
      // Try to find column headers or labels
      const { stdout: headerContent } = await exec(`cat "${sheetFile}" | grep -A 3 -B 3 "IND\\|eCTD\\|Module\\|workflow" | head -20`);
      
      console.log('\nPossible header or section content:');
      console.log(headerContent || 'No relevant header content found.');
    } else {
      console.log('No worksheet XML files found.');
    }
    
    // Clean up
    await exec(`rm -rf "${tempDir}"`);
    
    return true;
  } catch (error) {
    console.error(`Error extracting XML content: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('eCTD Machine Blueprint Analyzer');
  console.log('===============================');
  
  if (!checkFile()) {
    console.log('Exiting: File not accessible');
    return;
  }
  
  await getBasicFileInfo();
  await extractXmlContent();
  
  console.log('\nAnalysis complete.');
}

// Run the script
main().catch(err => {
  console.error('Fatal error:', err);
});