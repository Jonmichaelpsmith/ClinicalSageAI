import OpenAI from 'openai';

/**
 * Compliance Score module for CER AI
 * 
 * This module provides functionality to analyze a CER and score its compliance
 * against multiple regulatory standards using GPT-4o.
 */

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calculate compliance score for a CER using GPT-4o
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function complianceScoreHandler(req, res) {
  try {
    const { sections, title, standards = ['EU MDR', 'ISO 14155', 'FDA'] } = req.body;
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one section is required' });
    }
    
    // Map the sections for analysis
    const sectionsForAnalysis = sections.map(s => ({
      title: s.section || s.title,
      content: s.content
    }));
    
    console.log(`Analyzing compliance for CER: ${title} with ${sectionsForAnalysis.length} sections against standards: ${standards.join(', ')}`);
    
    // Analyze each section individually
    const sectionScores = await Promise.all(
      sectionsForAnalysis.map(section => analyzeSection(section, standards))
    );
    
    // Calculate overall compliance score (average of all section scores)
    const overallScore = calculateOverallScore(sectionScores);
    
    // Prepare the final scoring response
    const response = {
      title,
      overallScore,
      standards: createStandardsBreakdown(sectionScores, standards),
      sectionScores,
      timestamp: new Date().toISOString(),
      analysisMethod: 'gpt-4o',
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    res.status(500).json({ error: 'Failed to calculate compliance score' });
  }
}

/**
 * Analyze a single section for compliance against multiple standards
 * 
 * @param {Object} section - The section to analyze
 * @param {Array} standards - Array of standard names to evaluate against
 * @returns {Object} Section analysis results
 */
async function analyzeSection(section, standards) {
  try {
    // Create prompt for the AI model
    const prompt = createCompliancePrompt(section, standards);
    
    // Call OpenAI API with JSON response format
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const analysisResult = JSON.parse(response.choices[0].message.content);
    
    // Extract and format the response
    const result = {
      title: section.title,
      content: section.content.substring(0, 100) + '...',  // Include just a preview
      averageScore: calculateAverageScore(analysisResult.standards),
      standards: analysisResult.standards,
      suggestions: analysisResult.suggestions || [],
      analysisTimestamp: new Date().toISOString()
    };
    
    return result;
  } catch (error) {
    console.error(`Error analyzing section ${section.title}:`, error);
    return {
      title: section.title,
      error: `Analysis failed: ${error.message}`,
      averageScore: 0,
      standards: {}
    };
  }
}

/**
 * Create a prompt for the compliance analysis
 * 
 * @param {Object} section - The section to analyze
 * @param {Array} standards - Standards to check compliance against
 * @returns {String} The formatted prompt
 */
function createCompliancePrompt(section, standards) {
  return `You are a regulatory expert specializing in medical device Clinical Evaluation Reports (CERs).

Please analyze the following CER section titled "${section.title}" against these regulatory standards: ${standards.join(', ')}.

Section content:
${section.content}

Evaluate how well this section complies with each standard's requirements. Consider:
- Completeness of information
- Appropriate depth of analysis
- Use of evidence-based conclusions
- Appropriate risk assessment/benefit analysis (if applicable)
- Proper rationale and justification
- Clarity and structure

Provide a compliance score from 0.0-1.0 for each standard, where:
- 0.0-0.3: Significant non-compliance (missing critical elements)
- 0.4-0.6: Partial compliance (has essential elements but requires improvement)
- 0.7-0.9: Substantial compliance (meets most requirements with minor improvements needed)
- 1.0: Full compliance (meets all requirements)

Also provide specific improvement suggestions for non-compliant or partially compliant aspects.

Format your response as a JSON object with this structure:
{
  "standards": {
    "EU MDR": {
      "score": 0.0-1.0,
      "feedback": "Explanation of score and compliance assessment",
      "suggestions": ["Specific improvement suggestion 1", "Suggestion 2"]
    },
    "ISO 14155": {
      "score": 0.0-1.0,
      "feedback": "Explanation of score and compliance assessment",
      "suggestions": ["Specific improvement suggestion 1", "Suggestion 2"]
    },
    "FDA": {
      "score": 0.0-1.0,
      "feedback": "Explanation of score and compliance assessment",
      "suggestions": ["Specific improvement suggestion 1", "Suggestion 2"]
    }
  },
  "overall_assessment": "Brief summary of the overall compliance status",
  "suggestions": ["Key improvement suggestion 1", "Key suggestion 2"]
}`;
}

/**
 * Calculate average score across all standards for a section
 * 
 * @param {Object} standards - Standards scoring object
 * @returns {Number} The average score
 */
function calculateAverageScore(standards) {
  const scores = Object.values(standards).map(s => s.score);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return scores.length > 0 ? sum / scores.length : 0;
}

/**
 * Calculate overall compliance score
 * 
 * @param {Array} sectionScores - Scores for each section
 * @returns {Number} Overall score
 */
function calculateOverallScore(sectionScores) {
  const averageScores = sectionScores.map(s => s.averageScore);
  const sum = averageScores.reduce((acc, score) => acc + score, 0);
  return averageScores.length > 0 ? sum / averageScores.length : 0;
}

/**
 * Create a breakdown of compliance by standard
 * 
 * @param {Array} sectionScores - Scores for each section
 * @param {Array} standards - List of standards to include
 * @returns {Object} Standards breakdown
 */
function createStandardsBreakdown(sectionScores, standards) {
  const result = {};
  
  standards.forEach(standard => {
    // Collect scores for this standard across all sections
    const scores = sectionScores
      .filter(section => section.standards && section.standards[standard])
      .map(section => section.standards[standard].score);
    
    // Calculate average score for this standard
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const averageScore = scores.length > 0 ? sum / scores.length : 0;
    
    // Collect feedback and suggestions for this standard
    const feedback = sectionScores
      .filter(section => section.standards && section.standards[standard])
      .map(section => section.standards[standard].feedback)
      .join(' ');
      
    const suggestions = sectionScores
      .filter(section => section.standards && section.standards[standard] && section.standards[standard].suggestions)
      .flatMap(section => section.standards[standard].suggestions);
    
    result[standard] = {
      score: averageScore,
      feedback: feedback,
      suggestions: suggestions.slice(0, 5) // Limit to top 5 suggestions
    };
  });
  
  return result;
}
