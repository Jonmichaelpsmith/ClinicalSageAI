/**
 * AI Document Intelligence Routes
 * Provides various AI-powered document processing endpoints using OpenAI GPT-4o
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Error handling middleware for AI routes
 */
const handleAIError = (err, req, res, next) => {
  console.error('AI Service Error:', err);
  
  // Check for OpenAI API errors
  if (err.response && err.response.status) {
    return res.status(err.response.status).json({
      error: true,
      message: `OpenAI API Error: ${err.response.data.error.message || 'Unknown error'}`,
      type: 'api_error'
    });
  }
  
  // Check for missing API key
  if (err.message && err.message.includes('API key')) {
    return res.status(500).json({
      error: true,
      message: 'Missing or invalid OpenAI API key. Please check your environment configuration.',
      type: 'configuration_error'
    });
  }
  
  // Generic error
  return res.status(500).json({
    error: true,
    message: err.message || 'An unknown error occurred processing your AI request',
    type: 'server_error'
  });
};

/**
 * Generate content suggestions for document sections
 */
router.post('/content-suggestions', async (req, res, next) => {
  try {
    const { documentId, sectionId, currentContent, prompt } = req.body;
    
    if (!currentContent) {
      return res.status(400).json({
        error: true,
        message: 'Current content is required',
      });
    }

    // Create system message based on document section
    const systemPrompt = `You are an expert regulatory document writer specializing in electronic Common Technical Document (eCTD) submissions.
    You're currently helping with section ${sectionId}. Provide concise, accurate content suggestions to improve the current text.
    Focus on regulatory compliance, clarity, and scientific accuracy. Your suggestions should match the tone and style of regulatory documents.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the current content for section ${sectionId}:\n\n${currentContent}\n\n${prompt ? `Additional context: ${prompt}` : ''}Please suggest improvements to this text.` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const suggestion = response.choices[0].message.content;
    
    return res.json({
      documentId,
      sectionId,
      suggestion,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Check document content for compliance with regulatory standards
 */
router.post('/compliance-check', async (req, res, next) => {
  try {
    const { documentId, content, standards = ['ICH', 'FDA', 'EMA'] } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Document content is required',
      });
    }

    // Create system message for compliance checking
    const systemPrompt = `You are an expert regulatory compliance specialist with deep knowledge of ${standards.join(', ')} guidelines for medical/pharmaceutical document submissions.
    Analyze the provided document content and identify any compliance issues, missing elements, or areas that need improvement to meet ${standards.join(', ')} standards.
    Format your response as JSON with the following structure: 
    {
      "issues": [
        {
          "section": "Section identifier",
          "issue": "Description of the compliance issue",
          "severity": "high/medium/low",
          "guideline": "Specific guideline reference",
          "recommendation": "How to fix the issue"
        }
      ],
      "compliant_areas": [
        {
          "section": "Section identifier",
          "note": "What is done correctly"
        }
      ],
      "overall_compliance_score": 0-100,
      "summary": "Brief summary of compliance analysis"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this document content for compliance with ${standards.join(', ')} standards:\n\n${content}` }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Parse JSON response
    const complianceResults = JSON.parse(response.choices[0].message.content);
    
    return res.json({
      documentId,
      standards,
      results: complianceResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Analyze document formatting and provide suggestions
 */
router.post('/format-analysis', async (req, res, next) => {
  try {
    const { documentId, content, documentType } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Document content is required',
      });
    }

    // Create system message for format analysis
    const systemPrompt = `You are an expert document formatting specialist for regulatory documents, particularly ${documentType || 'eCTD submissions'}.
    Analyze the provided document content and identify any formatting issues, inconsistencies, or areas that could be improved for clarity and professional presentation.
    Format your response as JSON with the following structure:
    {
      "formatting_issues": [
        {
          "element": "tables/headings/lists/paragraphs/etc",
          "location": "description of where in the document",
          "issue": "Description of the formatting issue",
          "recommendation": "How to fix the issue",
          "example": "Example of correct formatting if applicable"
        }
      ],
      "style_consistency": {
        "headings": "consistent/inconsistent",
        "spacing": "consistent/inconsistent",
        "fonts": "consistent/inconsistent",
        "lists": "consistent/inconsistent"
      },
      "overall_format_score": 0-100,
      "summary": "Brief summary of formatting analysis"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze the formatting of this ${documentType || 'regulatory document'} content:\n\n${content}` }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Parse JSON response
    const formattingResults = JSON.parse(response.choices[0].message.content);
    
    return res.json({
      documentId,
      documentType,
      results: formattingResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Generate contextual responses to user queries about regulatory documents
 */
router.post('/ask', async (req, res, next) => {
  try {
    const { query, documentId, sectionId } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: true,
        message: 'Query is required',
      });
    }

    // Create system message for the assistant
    const systemPrompt = `You are TrialSage AI, a specialized document intelligence assistant for regulatory professionals working on eCTD submissions.
    You have expertise in ICH, FDA, and EMA guidelines for clinical trial submissions and regulatory documents.
    Your responses should be concise, accurate, and tailored to the context of ${sectionId ? `section ${sectionId} of ` : ''}${documentId ? `document ID ${documentId}` : 'the current document'}.
    When appropriate, cite specific regulatory guidelines or standards.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const answer = response.choices[0].message.content;
    
    return res.json({
      query,
      answer,
      context: {
        documentId: documentId || null,
        sectionId: sectionId || null
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Review document for consistency, gaps, and quality issues
 */
router.post('/document-review', async (req, res, next) => {
  try {
    const { documentId, content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Document content is required',
      });
    }

    // Create system message for comprehensive document review
    const systemPrompt = `You are an expert regulatory document reviewer with extensive experience in eCTD submissions.
    Conduct a comprehensive review of the provided document content to assess its quality, identify gaps, inconsistencies, and areas for improvement.
    Format your response as JSON with the following structure:
    {
      "quality_issues": [
        {
          "section": "Section identifier",
          "issue": "Description of the quality issue",
          "recommendation": "How to address the issue"
        }
      ],
      "strengths": [
        {
          "section": "Section identifier",
          "description": "What is done well"
        }
      ],
      "completeness": {
        "missing_elements": ["List of missing elements"],
        "incomplete_sections": ["List of incomplete sections"]
      },
      "consistency": {
        "terminology": "consistent/inconsistent",
        "messaging": "consistent/inconsistent",
        "references": "consistent/inconsistent"
      },
      "scientific_accuracy": {
        "issues": ["List of scientific accuracy issues"]
      },
      "overall_quality_score": 0-100,
      "priority_actions": ["List of highest priority actions to improve the document"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please review this document content:\n\n${content}` }
      ],
      temperature: 0.3,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    // Parse JSON response
    const reviewResults = JSON.parse(response.choices[0].message.content);
    
    return res.json({
      documentId,
      results: reviewResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// Apply error handling middleware
router.use(handleAIError);

module.exports = router;