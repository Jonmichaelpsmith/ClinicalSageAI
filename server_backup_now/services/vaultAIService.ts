import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function suggestTags(sectionText: string) {
  const prompt = `
    Identify up to 5 regulatory tags for this section:
    [${sectionText.slice(0,500)}…]
    Respond as JSON array of strings.
  `;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });
  return JSON.parse(resp.choices[0].message.content);
}