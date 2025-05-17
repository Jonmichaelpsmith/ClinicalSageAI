import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze manufacturing documentation for GMP compliance gaps
 * @param {Object} documentation - Text or images describing manufacturing practices
 * @returns {Promise<Object>} Structured analysis with gaps, severity and recommendations
 */
export async function analyzeGMPCompliance(documentation) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a GMP compliance auditor. Review the provided manufacturing documentation and identify any compliance gaps. Respond in JSON with fields \"gaps\" (array of {description, severity, recommendation}).`
        },
        {
          role: 'user',
          content: JSON.stringify({ documentation }).slice(0, 15000)
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error in analyzeGMPCompliance:', error);
    throw new Error('Failed to analyze GMP compliance: ' + error.message);
  }
}

export default { analyzeGMPCompliance };
