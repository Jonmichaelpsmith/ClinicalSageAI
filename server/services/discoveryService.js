// server/services/discoveryService.js
import OpenAI from 'openai';
import { Pool }   from 'pg';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Convert text → 1536-dim embedding
async function embed(text) {
  const r = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return r.data[0].embedding;
}

// Generic vector search on any table with `embedding` column
async function vectorSearch(table, vec, limit=10) {
  const sql = `
    SELECT *, 1 - (embedding <=> $1) AS score
      FROM ${table}
     ORDER BY embedding <=> $1
     LIMIT $2
  `;
  const { rows } = await db.query(sql, [vec, limit]);
  return rows;
}

/** 510(k) predicate finder */
export async function findPredicates(deviceDescription, opts={limit:8}) {
  const v = await embed(deviceDescription);
  const rows = await vectorSearch('predicate_devices', v, opts.limit);
  return rows.map(r => ({
    k_number: r.k_number,
    device_name: r.device_name,
    manufacturer: r.manufacturer,
    score: Number((r.score*100).toFixed(1))
  }));
}

/** CER literature search */
export async function searchLiterature(query, opts={limit:10}) {
  const v = await embed(query);
  const rows = await vectorSearch('literature_vectors', v, opts.limit);
  return rows.map(r => ({
    title: r.title,
    snippet: r.snippet,
    score: Number((r.score*100).toFixed(1))
  }));
}