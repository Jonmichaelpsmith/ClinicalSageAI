import OpenAI from 'openai';

/**
 * CER Compliance Score Module
 * 
 * This module provides a comprehensive compliance analysis of Clinical Evaluation Reports
 * against major regulatory frameworks including EU MDR 2017/745, ISO 14155, and FDA guidelines.
 */

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

/**
 * Analyze CER content against regulatory frameworks
 * @param {Array} sections - Array of CER sections with title and content
 * @returns {Object} Compliance score data
 */
export async function analyzeCERCompliance(sections) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    throw new Error('No sections provided for compliance analysis');
  }

  // Create a structured prompt for compliance analysis
  const sectionsText = sections.map(s => `## ${s.section || 'Untitled Section'}\n${s.content}`).join('\n\n');
  
  const prompt = `
    As a regulatory expert, analyze the following Clinical Evaluation Report (CER) content for compliance with major medical device regulatory frameworks.
    
    REGULATORY FRAMEWORKS TO EVALUATE AGAINST:
    1. EU MDR 2017/745 (Medical Device Regulation)
    2. ISO 14155 (Clinical investigation of medical devices for human subjects)
    3. FDA requirements for medical device submissions
    
    CER CONTENT TO ANALYZE:
    ${sectionsText}
    
    PROVIDE A STRUCTURED ANALYSIS WITH THE FOLLOWING:
    
    1. OVERALL COMPLIANCE SCORE (1-100%) with a brief explanation
    
    2. FRAMEWORK-SPECIFIC SCORES:
       - EU MDR 2017/745 compliance score (1-100%)
       - ISO 14155 compliance score (1-100%)
       - FDA requirements compliance score (1-100%)
       - Brief explanation for each framework score
    
    3. SECTION-BY-SECTION ANALYSIS:
       For each section, provide:
       - Section title
       - Compliance score (1-100%)
       - List of findings (both positive and negative)
       - Specific recommendations for improvement
    
    4. KEY FINDINGS:
       List the most important compliance issues or strengths in the overall document, with severity levels (high/medium/low)
    
    The analysis should be constructive, identifying both strengths and weaknesses, with actionable recommendations.
    
    RESPONSE FORMAT: Structured JSON data with the format:
    {
      "overallScore": number,
      "overallComment": "string",
      "frameworks": {
        "euMdr": { "score": number, "comments": "string" },
        "iso14155": { "score": number, "comments": "string" },
        "fda": { "score": number, "comments": "string" }
      },
      "sectionScores": [
        {
          "title": "string",
          "score": number,
          "findings": [
            { "type": "issue|strength", "message": "string" }
          ],
          "recommendations": ["string"]
        }
      ],
      "keyFindings": [
        { "severity": "high|medium|low", "message": "string" }
      ]
    }
  `;

  try {
    // Use GPT-4o to analyze compliance
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a regulatory expert specializing in medical device clinical evaluations and submissions. You provide accurate, detailed compliance analysis against EU MDR, ISO 14155, and FDA requirements."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    // Parse the JSON response
    const complianceData = JSON.parse(response.choices[0].message.content);
    return complianceData;
  } catch (error) {
    console.error('Compliance analysis error:', error);
    throw new Error(`Failed to analyze compliance: ${error.message}`);
  }
}

/**
 * Compliance score route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function complianceScoreHandler(req, res) {
  try {
    const { sections } = req.body;
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'No sections provided for compliance analysis' });
    }
    
    const complianceData = await analyzeCERCompliance(sections);
    res.json(complianceData);
  } catch (error) {
    console.error('Compliance score error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during compliance analysis' });
  }
}
