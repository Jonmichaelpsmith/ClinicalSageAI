// Script to replace all @shared/ imports with shared/
const fs = require('fs');
const { exec } = require('child_process');

// Find all files with @shared/
exec('grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "@shared/" --exclude-dir="node_modules" .', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error finding files: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
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
  filePathMap.forEach((_, filePath) => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace all @shared/ with shared/
      const newContent = content.replace(/@shared\//g, 'shared/');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`);
    }
  });
  
  console.log('Import replacement complete!');
});