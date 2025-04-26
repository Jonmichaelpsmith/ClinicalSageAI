import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSummary(buffer, contentType) {
  // For POC we pass limited text; in prod use proper extraction pipeline
  const base64 = buffer.toString('base64').slice(0, 10000);
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a regulatory medical writer. Provide a concise summary.' },
      { role: 'user', content: `Summarize this content: ${base64}` }
    ],
    max_tokens: 200
  });
  return resp.choices[0].message.content.trim();
}

export async function autoTag(buffer) {
  // simple POC – use keywords
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'List 5 relevant metadata tags (trial id, molecule, doc type, phase). Return as JSON array.' },
      { role: 'user', content: '<<document content omitted>>' }
    ],
    max_tokens: 60
  });
  try {
    return JSON.parse(resp.choices[0].message.content);
  } catch {
    return [];
  }
}