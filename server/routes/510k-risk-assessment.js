/**
 * FDA 510(k) Risk Assessment API
 * 
 * This API uses OpenAI's GPT-4o to analyze device profile, predicate devices,
 * and literature evidence to predict FDA submission risks and approval likelihood.
 */
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create a system prompt that instructs GPT-4o on how to analyze FDA submissions
const SYSTEM_PROMPT = `You are an FDA regulatory expert specializing in 510(k) medical device submissions.
Analyze the provided medical device information and generate a comprehensive risk assessment with the following components:

1. Approval Likelihood: Estimate the probability (0.0-1.0) of FDA clearance based on the submission data.
2. Risk Factors: Identify specific risks that could impact FDA clearance, each with:
   - Severity (high/medium/low)
   - Title (concise description)
   - Description (detailed explanation)
   - Potential impact on the submission outcome
3. Historical Comparisons: Identify similar devices from FDA's database with:
   - Device name and K-number
   - Clearance outcome and review timeline
   - Key differences from the current device
4. Strengths: List specific strengths that enhance the likelihood of clearance
5. Recommendations: Provide actionable suggestions to improve the submission

Base your analysis on FDA's current 510(k) guidelines, regulatory precedents, and the specific details of this submission.
Ensure your assessment is thorough, accurate, and actionable.`;

/**
 * Predict FDA submission risks
 * 
 * POST /api/510k/predict-risks
 * 
 * @body {Object} deviceProfile - Device information including name, classification, description, etc.
 * @body {Array} predicateDevices - List of predicate devices
 * @body {Object} literatureEvidence - Supporting literature evidence
 * @body {Object} options - Additional analysis options
 * 
 * @returns {Object} Risk assessment results
 */
router.post('/predict-risks', async (req, res) => {
  try {
    console.log('Received risk assessment request');
    
    const { deviceProfile, predicateDevices, literatureEvidence, equivalenceData, options } = req.body;
    
    if (!deviceProfile) {
      return res.status(400).json({
        success: false,
        error: 'Device profile is required'
      });
    }
    
    // Format the data for OpenAI analysis
    const analysisData = {
      device: deviceProfile,
      predicates: predicateDevices || [],
      literature: literatureEvidence || [],
      equivalence: equivalenceData || null,
      options: options || {}
    };
    
    // Prepare the formatted data for GPT-4o
    const formattedAnalysis = JSON.stringify(analysisData, null, 2);
    
    console.log('Calling OpenAI for risk assessment');
    
    // Call OpenAI with our formatted data
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please analyze this medical device submission data for FDA 510(k) clearance risks and provide a comprehensive assessment:\n\n${formattedAnalysis}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 3000 // Allow for detailed analysis
    });
    
    // Extract the structured risk assessment from GPT-4o
    const analysis = JSON.parse(completion.choices[0].message.content);
    
    // Process and enhance the OpenAI response
    const enhancedResponse = {
      success: true,
      deviceName: deviceProfile.name || 'Unknown Device',
      approvalLikelihood: analysis.approvalLikelihood || (analysis.approval_likelihood ? parseFloat(analysis.approval_likelihood) : null),
      riskFactors: analysis.riskFactors || analysis.risk_factors || [],
      historicalComparisons: analysis.historicalComparisons || analysis.historical_comparisons || [],
      strengths: analysis.strengths || [],
      recommendations: analysis.recommendations || [],
      hasLiteratureEvidence: literatureEvidence && literatureEvidence.length > 0,
      evidenceCount: literatureEvidence ? literatureEvidence.length : 0,
      assessmentDate: new Date().toISOString(),
      requestId: completion.id,
      analysis_metadata: {
        model: "gpt-4o",
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      }
    };
    
    console.log('Risk assessment completed successfully');
    
    // Return the enhanced risk assessment
    return res.json(enhancedResponse);
  } catch (error) {
    console.error('Error in FDA risk assessment:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error generating risk assessment',
      riskFactors: [],
      recommendations: [
        'Ensure device profile is complete with all required information',
        'Add at least one valid predicate device for comparison',
        'Include supporting literature evidence for key claims',
        'Complete the substantial equivalence section thoroughly'
      ]
    });
  }
});

module.exports = router;