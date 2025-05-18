/**
 * CER Compliance Score Handler
 * 
 * This module provides the API endpoint handler for calculating compliance scores
 * of Clinical Evaluation Reports against multiple regulatory standards using GPT-4o.
 * 
 * The analysis evaluates each section for content quality, completeness, and alignment
 * with EU MDR, FDA 21 CFR 812, and ISO 14155 requirements.
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get a compliance score for CER sections against regulatory standards using GPT-4o
 * @param {Request} req - Express request object with sections, title, and standards
 * @param {Response} res - Express response object
 */
async function complianceScoreHandler(req, res) {
  try {
    const { sections, title, standards = ['EU MDR', 'ISO 14155', 'FDA'] } = req.body;
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Valid sections array is required' });
    }
    
    // Prepare the sections content for analysis
    const sectionsForAnalysis = sections.map((section, index) => ({
      id: `section-${index + 1}`,
      title: section.title || `Section ${index + 1}`,
      type: section.type || section.sectionType || 'general',
      content: section.content || '',
    }));
    
    // Construct the prompt for GPT-4o analysis
    const analysisPrompt = {
      role: 'system',
      content: `You are an expert medical device regulatory compliance assessor specialized in Clinical Evaluation Reports (CERs). 
      Your task is to evaluate the provided CER sections for compliance with the following regulatory standards: ${standards.join(', ')}.
      
      For each section, assess:
      1. Content quality and completeness
      2. Alignment with regulatory requirements
      3. Identification of any critical gaps
      4. Specific improvement suggestions
      
      Analyze the document titled "${title || 'Clinical Evaluation Report'}" and provide a structured compliance report.
      
      Respond with a JSON object having the following structure:
      {
        "overallScore": (decimal between 0-1),
        "summary": "Overall assessment summary",
        "standards": {
          "EU MDR": {
            "score": (decimal between 0-1),
            "feedback": "Standard-specific feedback",
            "criticalGaps": ["list of critical gaps"]
          },
          ... (repeat for other standards)
        },
        "sectionScores": [
          {
            "id": "section ID",
            "title": "section title",
            "averageScore": (decimal between 0-1),
            "standards": {
              "EU MDR": {
                "score": (decimal between 0-1),
                "feedback": "Standard-specific section feedback",
                "suggestions": ["improvement suggestions"]
              },
              ... (repeat for other standards)
            }
          },
          ... (repeat for other sections)
        ]
      }`
    };

    // Create user message with sections content
    const userMessage = {
      role: 'user',
      content: `Please analyze the following CER sections for compliance with ${standards.join(', ')} standards:\n\n${sectionsForAnalysis.map(section => `## ${section.title}\n${section.content}\n\n`).join('')}`
    };

    console.log('Sending compliance analysis request to OpenAI...');
    // Call OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [analysisPrompt, userMessage],
      temperature: 0.2, // Lower temperature for more consistent analysis
      response_format: { type: "json_object" }
    });

    // Parse the response content as JSON
    const analysisResult = JSON.parse(response.choices[0].message.content);
    
    // Return the compliance analysis results
    res.json(analysisResult);
    
  } catch (error) {
    console.error('Error in compliance score analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze compliance',
      message: error.message || 'An unknown error occurred'
    });
  }
}

module.exports = complianceScoreHandler;
