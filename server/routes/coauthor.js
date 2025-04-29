/**
 * CoAuthor API Routes
 * 
 * Provides endpoints for the eCTD Co-Author feature:
 * - GET /api/coauthor/context - Retrieve context snippets based on a search query
 * - POST /api/coauthor/generate - Generate a draft for a CTD section
 * - POST /api/coauthor/validate - Validate section content against regulatory requirements
 */

import express from 'express';
import { retrieveContext, validateCompliance } from '../services/coauthor.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('🚀 Initializing CoAuthor API routes');

/**
 * Context Retrieval Endpoint
 * GET /api/coauthor/context
 */
router.get('/context', async (req, res) => {
  const { query } = req.query;
  console.log('📚 GET /api/coauthor/context', { query });
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Query parameter is required' 
    });
  }
  
  try {
    // Retrieve context snippets based on the query
    const snippets = await retrieveContext(query);
    
    return res.json({
      success: true,
      snippets
    });
  } catch (error) {
    console.error('Error retrieving context:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve context'
    });
  }
});

/**
 * Draft Generation Endpoint
 * POST /api/coauthor/generate
 */
router.post('/generate', async (req, res) => {
  // Support both parameter formats for backward compatibility
  const { moduleId, sectionId, prompt, context, module, section, currentText, contextSnippets } = req.body;
  
  // Use new parameter format if provided, fall back to old format
  const effectiveModuleId = module || moduleId;
  const effectiveSectionId = section || sectionId;
  const effectivePrompt = currentText || prompt;
  const effectiveContext = contextSnippets || context;
  
  console.log('🐙 POST /api/coauthor/generate', { 
    moduleId: effectiveModuleId, 
    sectionId: effectiveSectionId,
    contextCount: Array.isArray(effectiveContext) ? effectiveContext.length : 0
  });
  
  try {
    // Format the context for the AI
    const formattedContext = effectiveContext && effectiveContext.length > 0 
      ? `\n\nRELEVANT CONTEXT:\n${effectiveContext.map((c, i) => 
          `[${i+1}] ${typeof c === 'string' ? c : c.text}`).join('\n\n')}`
      : "";
    
    // Get the section details based on CTD structure
    const sectionInfo = getCtdSectionInfo(effectiveModuleId, effectiveSectionId);
    
    // Generate the draft using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an expert regulatory medical writer specializing in CTD submissions.
          You are drafting content for eCTD Module ${effectiveModuleId.replace('m', '')} Section ${effectiveSectionId}: ${sectionInfo.title}.
          
          PURPOSE OF THIS SECTION:
          ${sectionInfo.description}
          
          WRITING STYLE:
          - Write in formal, scientific language appropriate for regulatory submissions
          - Be concise but comprehensive
          - Use clear section headings and subheadings
          - Maintain consistent tense throughout
          - Avoid marketing language or unsupported claims
          - Focus on scientific data and objective analysis
          - Follow ICH guidelines for content and structure
          
          OUTPUT FORMAT:
          - Markdown format with clear headings and subheadings
          - Include appropriate placeholders for data or study references
          - Structure according to regulatory expectations${formattedContext}`
        },
        {
          role: "user",
          content: `Draft content for Module ${effectiveModuleId.replace('m', '')} Section ${effectiveSectionId} with the following guidance: ${effectivePrompt}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    const draft = response.choices[0].message.content;
    
    return res.json({
      success: true,
      draft,
      contextUsed: effectiveContext || []
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    return res.status(500).json({
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate draft'
    });
  }
});

/**
 * Draft Validation Endpoint
 * POST /api/coauthor/validate
 */
router.post('/validate', async (req, res) => {
  const { section, moduleId, sectionId } = req.body;
  console.log('🔍 POST /api/coauthor/validate', { moduleId, sectionId });
  
  try {
    // Call the service to validate the section
    const issues = await validateCompliance(section, moduleId, sectionId);
    
    return res.json({
      success: true,
      valid: issues.length === 0,
      issues
    });
  } catch (error) {
    console.error('Error validating section:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate section'
    });
  }
});

/**
 * Get CTD section information based on moduleId and sectionId
 */
function getCtdSectionInfo(moduleId, sectionId) {
  // Map of common CTD sections
  const ctdMap = {
    'm1': {
      '1.1': {
        title: 'Table of Contents',
        description: 'Comprehensive table of contents for the entire application.'
      },
      '1.2': {
        title: 'Application Form',
        description: 'Completed application form for the submission.'
      }
    },
    'm2': {
      '2.1': {
        title: 'CTD Table of Contents',
        description: 'Table of contents for Module 2-5.'
      },
      '2.2': {
        title: 'Introduction',
        description: 'Brief introduction to the medicinal product, including its pharmacological class, mode of action, and proposed clinical use.'
      },
      '2.3': {
        title: 'Quality Overall Summary',
        description: 'Summary of quality information related to the drug substance and drug product.'
      },
      '2.4': {
        title: 'Nonclinical Overview',
        description: 'Integrated overview and assessment of the pharmacologic, pharmacokinetic, and toxicologic evaluations.'
      },
      '2.5': {
        title: 'Clinical Overview',
        description: 'Critical assessment of clinical data, including benefits and risks of the medicinal product in its intended use.'
      },
      '2.6': {
        title: 'Nonclinical Written and Tabulated Summaries',
        description: 'Detailed summaries of nonclinical information, including pharmacology, pharmacokinetics, and toxicology.'
      },
      '2.7': {
        title: 'Clinical Summary',
        description: 'Detailed summary of clinical information, including biopharmaceutic studies, clinical pharmacology studies, clinical efficacy, clinical safety, and literature references.'
      }
    },
    'm3': {
      '3.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 3.'
      },
      '3.2': {
        title: 'Body of Data',
        description: 'Comprehensive quality data including drug substance and drug product information.'
      }
    },
    'm4': {
      '4.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 4.'
      },
      '4.2': {
        title: 'Study Reports',
        description: 'Nonclinical study reports, including pharmacology, pharmacokinetics, and toxicology.'
      }
    },
    'm5': {
      '5.1': {
        title: 'Table of Contents',
        description: 'Table of contents for Module 5.'
      },
      '5.2': {
        title: 'Tabular Listing of All Clinical Studies',
        description: 'Tabular listing of all clinical studies.'
      },
      '5.3': {
        title: 'Clinical Study Reports',
        description: 'Reports of biopharmaceutic studies, clinical pharmacology studies, clinical efficacy and safety studies, and published literature.'
      },
      '5.4': {
        title: 'Literature References',
        description: 'Literature references cited in the application.'
      }
    }
  };
  
  // Return the section info if found, or a generic description
  if (ctdMap[moduleId]?.[sectionId]) {
    return ctdMap[moduleId][sectionId];
  }
  
  return {
    title: `Section ${sectionId}`,
    description: `Content for CTD module ${moduleId.replace('m', '')} section ${sectionId}.`
  };
}

export default router;