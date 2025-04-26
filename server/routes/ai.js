import express from 'express';
import OpenAI from 'openai';
import * as ds from '../services/docushare.js';
import { extractTextFromBuffer } from '../utils/documentParser.js';
import { validateTenantAccess } from '../middleware/validateTenantAccess.js';
import { auditAction } from '../middleware/auditLogger.js';

const router = express.Router();

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Document Summarization Endpoint
 * 
 * Fetches document content from DocuShare and generates
 * a concise summary using OpenAI with tenant validation.
 */
router.post('/summarize', 
  validateTenantAccess(),  // Multi-tenant security middleware
  auditAction('AI_Summarize', 'Document summarized with AI'),  // Audit logging middleware
  async (req, res) => {
    try {
      const { documentId } = req.body;
      
      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      // Get document metadata first (already validated by middleware)
      const metadata = await ds.getMetadata(documentId);
      
      // Download document content securely
      const documentBuffer = await ds.download(documentId);
      
      // Extract text from document (handling different formats)
      let documentText = '';
      try {
        documentText = await extractTextFromBuffer(documentBuffer, documentId);
      } catch (extractionError) {
        console.error('Text extraction error:', extractionError);
        documentText = 'Text extraction failed. Please ensure the document is in a supported format.';
      }
      
      // Truncate text if it's too long for the API
      const maxLength = 15000; // Approximation to stay within token limits
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '... [content truncated due to length]'
        : documentText;
      
      // Call OpenAI API for summarization
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert regulatory medical writer specializing in IND submissions and pharmaceutical documentation. Summarize clinical and regulatory documents clearly and concisely, focusing on the most important regulatory implications and key findings."
          },
          {
            role: "user",
            content: `Summarize the following document in a structured format with clear sections. Focus on key regulatory points, findings, and implications for IND submission:\n\n${truncatedText}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      });
      
      const summary = completion.choices[0].message.content;
      
      // Log the successful summarization
      console.log(`Document summarized successfully: ${documentId} for tenant ${req.user?.tenantId || 'public'}`);
      
      // Return the summary to the client
      res.json({ 
        summary,
        documentId,
        documentName: metadata?.name || 'Unknown document',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Document summarization error:', error);
      res.status(500).json({ 
        error: 'Failed to summarize document',
        message: error.message 
      });
    }
  }
);

/**
 * Regulatory Analysis Endpoint
 * 
 * Analyzes document content to extract regulatory insights
 * using OpenAI.
 */
router.post('/analyze/regulatory', 
  validateTenantAccess(),  // Multi-tenant security middleware
  auditAction('AI_Analysis', 'Document analyzed for regulatory insights'),  // Audit logging middleware
  async (req, res) => {
    try {
      const { documentId } = req.body;
      
      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      // Get document metadata (already validated by middleware)
      const metadata = await ds.getMetadata(documentId);
      
      // Download document content
      const documentBuffer = await ds.download(documentId);
      const documentText = await extractTextFromBuffer(documentBuffer, documentId);
      
      // Truncate if needed
      const maxLength = 15000;
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '... [content truncated due to length]'
        : documentText;
      
      // Call OpenAI API for regulatory analysis
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert regulatory affairs consultant specializing in FDA IND submissions. Extract regulatory insights, potential issues, and compliance notes from documents. Provide structured output in JSON format."
          },
          {
            role: "user",
            content: `Analyze this regulatory document and extract key regulatory insights, identifying potential compliance issues or concerns for IND submissions. Format your response as JSON with sections for 'keyInsights', 'complianceNotes', 'potentialIssues', and 'recommendations':\n\n${truncatedText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      // Parse the JSON response
      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Add metadata to the response
      const response = {
        ...analysis,
        documentId,
        documentName: metadata?.name || 'Unknown document',
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('Regulatory analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze document for regulatory insights',
        message: error.message 
      });
    }
  }
);

/**
 * IND Template Generation Endpoint
 * 
 * Generates IND-specific document templates based on 
 * provided parameters using OpenAI.
 */
router.post('/generate/ind-template',
  auditAction('Template_Generation', 'IND Template generated using AI'),  // Audit logging middleware 
  async (req, res) => {
    try {
      const { templateType, moduleType, studyPhase, indication, ...additionalParams } = req.body;
      
      if (!templateType || !moduleType) {
        return res.status(400).json({ error: 'Template type and module type are required' });
      }
      
      // Construct the prompt based on template type
      let systemPrompt = "You are an expert regulatory medical writer specializing in IND submissions.";
      let userPrompt = `Generate a template for an IND submission ${moduleType} document`;
      
      switch (templateType) {
        case 'protocol':
          systemPrompt += " Focus on creating clinical trial protocols that meet FDA standards.";
          userPrompt += ` for a Phase ${studyPhase || 'I'} clinical trial`;
          break;
        case 'coverLetter':
          systemPrompt += " Focus on formal regulatory correspondence with FDA.";
          userPrompt += ` cover letter`;
          break;
        case 'cmc':
          systemPrompt += " Focus on Chemistry, Manufacturing, and Controls documentation.";
          userPrompt += ` CMC section`;
          break;
        default:
          userPrompt += ` of type ${templateType}`;
      }
      
      // Add indication if provided
      if (indication) {
        userPrompt += ` for ${indication}`;
      }
      
      // Add any additional parameters
      if (Object.keys(additionalParams).length > 0) {
        userPrompt += ` with the following specifications: ${JSON.stringify(additionalParams)}`;
      }
      
      // Call OpenAI API for template generation
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.4,
      });
      
      const templateContent = completion.choices[0].message.content;
      
      res.json({ 
        templateContent,
        templateType,
        moduleType,
        studyPhase: studyPhase || 'N/A',
        indication: indication || 'N/A',
        generatedAt: new Date().toISOString(),
        generatedBy: req.user?.id || 'anonymous',
        tenantId: req.user?.tenantId || 'public'
      });
    } catch (error) {
      console.error('Template generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate IND template',
        message: error.message 
      });
    }
  }
);

export default router;