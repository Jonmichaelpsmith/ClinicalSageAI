import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes CER sections for regulatory compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const complianceScoreHandler = async (req, res) => {
  try {
    const { sections, title, standards = ['EU MDR', 'ISO 14155', 'FDA'] } = req.body;

    // Validate input
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid sections. Must provide an array of CER sections.'
      });
    }

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required for compliance analysis.'
      });
    }

    console.log(`Performing compliance analysis for ${title} with ${sections.length} sections`);
    
    // Extract section content for analysis
    const sectionTexts = sections.map(section => {
      return {
        id: section.id || Math.random().toString(36).substring(2, 9),
        title: section.title || 'Untitled Section',
        content: section.content || '',
        type: section.type || 'general'
      };
    });

    // Prepare the analysis prompt for each regulatory standard
    const standardsAnalysis = {};
    let overallScore = 0;
    let sectionScores = [];

    for (const standard of standards) {
      const standardScore = await analyzeComplianceForStandard(sectionTexts, title, standard);
      standardsAnalysis[standard] = standardScore;
      
      // Aggregate scores for overall evaluation
      if (standardScore.score) {
        overallScore += standardScore.score;
      }
      
      // Track individual section scores
      if (standardScore.sectionAnalysis) {
        for (const sectionAnalysis of standardScore.sectionAnalysis) {
          const existingSection = sectionScores.find(s => s.id === sectionAnalysis.id);
          
          if (existingSection) {
            existingSection.standards[standard] = {
              score: sectionAnalysis.score,
              feedback: sectionAnalysis.feedback,
              suggestions: sectionAnalysis.suggestions
            };
            // Update the average score
            const scores = Object.values(existingSection.standards).map(s => s.score);
            existingSection.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          } else {
            sectionScores.push({
              id: sectionAnalysis.id,
              title: sectionAnalysis.title,
              standards: {
                [standard]: {
                  score: sectionAnalysis.score,
                  feedback: sectionAnalysis.feedback,
                  suggestions: sectionAnalysis.suggestions
                }
              },
              averageScore: sectionAnalysis.score
            });
          }
        }
      }
    }

    // Calculate final overall score as average of all standards
    const finalOverallScore = overallScore / standards.length;

    // Prepare detailed response
    const response = {
      success: true,
      title,
      overallScore: Math.round(finalOverallScore * 100) / 100, // Round to 2 decimal places
      standards: standardsAnalysis,
      sectionScores: sectionScores.sort((a, b) => a.averageScore - b.averageScore), // Sort by ascending score (worst first)
      summary: generateComplianceSummary(sectionScores, standards, finalOverallScore),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error in compliance score analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze compliance',
      message: error.message 
    });
  }
};

/**
 * Analyzes compliance for a specific regulatory standard
 * @param {Array} sections - Array of section objects with content
 * @param {string} title - Title of the CER
 * @param {string} standard - Regulatory standard to check against
 * @returns {Object} - Compliance analysis for the standard
 */
async function analyzeComplianceForStandard(sections, title, standard) {
  try {
    // Build guidance prompt for specific standard
    let guidancePrompt = '';
    
    switch(standard) {
      case 'EU MDR':
        guidancePrompt = 'The EU Medical Device Regulation (2017/745) requires Clinical Evaluation Reports to include: device description, clinical background and intended purpose, state of the art analysis, risk-benefit analysis, comprehensive literature search, clinical data evaluation, and post-market surveillance plan. Each section must be thorough, evidence-based, and traceable.';
        break;
        
      case 'ISO 14155':
        guidancePrompt = 'ISO 14155 requires clinical evaluation to address: device description, clinical evaluation plan, clinical evaluation methodology, data analysis methods, benefit-risk determination, literature review and data collection process. The evaluation must ensure scientific validity, ethical principles, and clinical evidence adequacy.';
        break;
        
      case 'FDA':
        guidancePrompt = 'FDA guidance requires clinical evaluation to include: indications for use, target population, device technological characteristics, summary of clinical evidence, benefit-risk profile, clinical data collection methods, and analysis of adverse events. Sections should contain objective evaluation of evidence quality and support for claims.';
        break;
        
      default:
        guidancePrompt = 'Evaluate the clinical evaluation report for completeness, clarity, scientific validity, evidence quality, and logical flow between sections. Each section should be comprehensive and well-supported by data.';
    }
    
    // Prepare sections content for analysis
    const sectionsContent = sections.map(s => `Section: ${s.title}\n${s.content.substring(0, 500)}...`).join('\n\n');
    
    // Generate the compliance analysis using OpenAI
    const prompt = `
      You are an expert in medical device regulatory compliance assessment. 
      Analyze the following Clinical Evaluation Report (CER) titled "${title}" for compliance with ${standard} standards.
      
      Regulatory Requirements Context:
      ${guidancePrompt}
      
      Report Sections:
      ${sectionsContent}
      
      Please provide:
      1. An overall compliance score from 0.0 to 1.0 (where 1.0 is fully compliant)
      2. Individual assessment of each section with specific scores from 0.0 to 1.0
      3. Detailed feedback for each section
      4. Specific suggestions for improvement
      5. A summary of the overall compliance status
      
      Format your response as a JSON object with the following structure:
      {
        "score": number, // Overall score from 0.0 to 1.0
        "sectionAnalysis": [
          {
            "id": string, // Section ID
            "title": string, // Section title
            "score": number, // Section score from 0.0 to 1.0
            "feedback": string, // Detailed feedback
            "suggestions": [string] // Array of improvement suggestions
          }
        ],
        "overallFeedback": string, // General compliance assessment
        "criticalGaps": [string] // Array of critical compliance gaps
      }
    `;
    
    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the latest model which was trained on regulatory guidelines
      messages: [
        { role: 'system', content: 'You are a medical device regulatory expert specializing in Clinical Evaluation Reports. Provide detailed, actionable compliance analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 2000 // Allow sufficient space for detailed analysis
    });
    
    // Parse the results
    const analysisText = response.choices[0].message.content.trim();
    let analysisJson;
    
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0]);
      } else {
        // Fall back to direct parsing if needed
        analysisJson = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('Error parsing compliance analysis JSON:', parseError);
      console.log('Raw response:', analysisText);
      
      // Generate a fallback response with warning
      return {
        score: 0.5,
        sectionAnalysis: sections.map(s => ({
          id: s.id,
          title: s.title,
          score: 0.5,
          feedback: 'Unable to generate detailed feedback. Please retry analysis.',
          suggestions: ['Review against ' + standard + ' requirements manually']
        })),
        overallFeedback: 'Analysis encountered technical difficulties. Consider re-running with more focused content.',
        criticalGaps: ['Unable to determine critical gaps due to analysis failure']
      };
    }
    
    return analysisJson;
  } catch (error) {
    console.error(`Error analyzing compliance for ${standard}:`, error);
    throw error;
  }
}

/**
 * Generates a summary of compliance status across all standards
 * @param {Array} sectionScores - Array of section scores
 * @param {Array} standards - Array of regulatory standards
 * @param {number} overallScore - Overall compliance score
 * @returns {string} - Summary text
 */
function generateComplianceSummary(sectionScores, standards, overallScore) {
  // Get sections with lowest scores to highlight issues
  const sortedSections = [...sectionScores].sort((a, b) => a.averageScore - b.averageScore);
  const lowScoringSections = sortedSections.filter(s => s.averageScore < 0.7).slice(0, 3);
  
  // Format standards for text
  const standardsText = standards.join(', ');
  
  // Determine overall compliance level
  let complianceLevel;
  if (overallScore >= 0.9) {
    complianceLevel = 'excellent';
  } else if (overallScore >= 0.8) {
    complianceLevel = 'good';
  } else if (overallScore >= 0.7) {
    complianceLevel = 'acceptable';
  } else if (overallScore >= 0.6) {
    complianceLevel = 'marginal';
  } else {
    complianceLevel = 'poor';
  }
  
  // Generate appropriate message based on score
  let summary;
  if (lowScoringSections.length === 0) {
    summary = `This Clinical Evaluation Report demonstrates ${complianceLevel} overall compliance (${Math.round(overallScore * 100)}%) with ${standardsText} standards. All sections meet the minimum compliance requirements, with consistent quality across the document.`;
  } else {
    const sectionNames = lowScoringSections.map(s => s.title).join(', ');
    summary = `This Clinical Evaluation Report shows ${complianceLevel} overall compliance (${Math.round(overallScore * 100)}%) with ${standardsText} standards. To improve regulatory readiness, focus on enhancing the following sections: ${sectionNames}. Addressing the specific feedback for these sections will significantly improve overall compliance.`;
  }
  
  return summary;
}
