import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'server', 'data', 'securitySettings.json');

export function loadSecuritySettings() {
  if (!fs.existsSync(dataFile)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return {};
  }
}

export function saveSecuritySettings(settings) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(settings, null, 2));
}
