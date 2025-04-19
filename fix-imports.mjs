// ES Module version of the script to replace all @shared/ imports with shared/
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function replaceImports() {
  try {
    console.log('Searching for files with @shared/ imports...');
    const { stdout } = await execPromise('grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "@shared/" --exclude-dir="node_modules" --exclude-dir=".git" .');
    
    const lines = stdout.split('\n').filter(line => line.trim() !== '');
    console.log(`Found ${lines.length} occurrences of @shared/ in project files`);
    
    const filePathMap = new Map();
    
    lines.forEach(line => {
      const parts = line.split(':');
      const filePath = parts[0];
      
      if (!filePathMap.has(filePath)) {
        filePathMap.set(filePath, true);
      }
    });
    
    console.log(`Found ${filePathMap.size} files with @shared/ imports`);
    
    // Process each file
    for (const filePath of filePathMap.keys()) {
      try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Replace all @shared/ with shared/
        const newContent = content.replace(/@shared\//g, 'shared/');
        
        if (content !== newContent) {
          await fs.writeFile(filePath, newContent, 'utf8');
          console.log(`Updated: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
      }
    }
    
    console.log('Import replacement complete!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

replaceImports();