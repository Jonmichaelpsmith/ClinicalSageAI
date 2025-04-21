import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all JS/JSX/TS/TSX files
function findFiles(dir, extensions) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.includes(path.extname(filePath))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Replace all react-toastify imports
function fixToastifyImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace different import patterns
    const patterns = [
      {
        regex: /import\s+.*\s+from\s+['"]react-toastify.*['"]/g,
        replacement: '// Import removed by fix-toast-imports.js'
      },
      {
        regex: /import\s+['"]react-toastify\/dist\/ReactToastify\.css['"]/g,
        replacement: '// CSS import removed by fix-toast-imports.js'
      },
      {
        regex: /.*toast\([^\)]+\).*/g,
        replacement: (match) => {
          return match.replace(/toast\(([^)]+)\)/, "// toast call replaced\n  // Original: toast($1)\n  console.log('Toast would show:', $1)");
        }
      }
    ];

    for (const pattern of patterns) {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
  
  return false;
}

// Main function
function main() {
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  const clientDir = path.join(__dirname, 'client');
  const files = findFiles(clientDir, extensions);
  
  console.log(`Scanning ${files.length} files for react-toastify imports...`);
  
  let fixedCount = 0;
  for (const file of files) {
    if (fixToastifyImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nFixed imports in ${fixedCount} files.`);
}

main();