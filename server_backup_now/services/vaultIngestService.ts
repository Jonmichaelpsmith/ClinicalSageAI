import Tesseract from 'tesseract.js';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';

// splits into preliminary sections by heading regex
function splitSections(text: string) {
  const headings = text.split(/\n(?=[A-Z][a-z ].{0,50}\n)/);
  return headings.map((sec, i) => ({ id: i+1, content: sec.trim() }));
}

export async function ingestDocument(filePath: string) {
  // 1. OCR the file
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  // 2. Split into sections
  const sections = splitSections(text);
  // 3. Persist JSON for downstream use
  const docId = uuid();
  
  // Ensure vault directory exists
  const vaultDir = path.join(process.cwd(), 'vault');
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(vaultDir, `${docId}.json`), JSON.stringify({ docId, sections }));
  return { docId, sections };
}