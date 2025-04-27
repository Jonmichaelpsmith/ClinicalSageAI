import db from '../db.js';

const allowedTables = ['programs', 'studies', 'documents', 'subject_data'];

export function validateSelect(sql) {
  if (!sql.trim().toLowerCase().startsWith('select')) throw new Error('Only SELECT allowed');
  
  for (const token of sql.match(/from\s+(\w+)/ig) || []) {
    const tbl = token.split(/\s+/)[1].replace(/[^a-zA-Z0-9_]/g, '');
    if (!allowedTables.includes(tbl)) throw new Error('Table not permitted');
  }
}

export async function runQuery(sql) { 
  validateSelect(sql); 
  return (await db.raw(sql)).rows; 
}