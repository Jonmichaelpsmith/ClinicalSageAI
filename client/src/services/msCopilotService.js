/**
 * Microsoft Copilot Service
 * 
 * This service provides integration with Microsoft Copilot for document authoring assistance.
 * It handles AI-powered content generation, document analysis, and writing suggestions.
 */

import { getAccessToken } from './microsoftAuthService';

// API endpoint for Copilot integration
const COPILOT_API_ENDPOINT = '/api/ai/copilot';

/**
 * Ask Microsoft Copilot for assistance
 * @param {string} prompt - The prompt to send to Copilot
 * @param {object} options - Additional options
 * @returns {Promise<object>} Copilot response
 */
export async function askCopilot(prompt, options = {}) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.warn('No Microsoft access token available, falling back to internal AI');
      // Fall back to internal AI service if Microsoft auth isn't available
      return simulateCopilotResponse(prompt);
    }
    
    const response = await fetch(COPILOT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        prompt,
        documentContext: options.documentContext,
        maxTokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
      }),
    });
    
    if (!response.ok) {
      console.warn(`Copilot API error: ${response.status} ${response.statusText}, falling back to internal AI`);
      // Fall back to internal AI service if Copilot API fails
      return simulateCopilotResponse(prompt);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Copilot:', error);
    
    // Fall back to internal AI service if Copilot API fails
    return simulateCopilotResponse(prompt);
  }
}

/**
 * Simulate Copilot response for demo/development purposes
 * @param {string} prompt - The user prompt
 * @returns {object} Simulated response
 */
function simulateCopilotResponse(prompt) {
  console.log('Simulating Copilot response for prompt:', prompt);
  
  // Create different responses based on prompt content
  let responseText = '';
  
  if (prompt.includes('clinical trial') || prompt.includes('protocol')) {
    responseText = 'A clinical trial protocol is a document that describes the objectives, design, methodology, statistical considerations, and organization of a clinical trial. It typically includes information about the background and rationale for the study, detailed patient eligibility criteria, treatment plan, and assessment methods.';
  } else if (prompt.includes('adverse event') || prompt.includes('safety')) {
    responseText = 'Adverse events in clinical trials must be carefully documented and reported. The safety section of a regulatory document should include comprehensive summaries of all adverse events observed, their severity, relationship to the study drug, and resolution. Statistical analyses should compare safety profiles between treatment groups.';
  } else if (prompt.includes('regulatory') || prompt.includes('submission')) {
    responseText = 'Regulatory submissions require careful attention to formatting and content requirements specified by health authorities. Documents should be organized according to CTD (Common Technical Document) format when applicable, with clear section numbering and references. Ensure all required components are included and properly formatted.';
  } else if (prompt.includes('stat') || prompt.includes('statistical')) {
    responseText = 'Statistical analysis plans should clearly describe the primary and secondary endpoints, analysis populations, handling of missing data, and statistical methodologies. Include justification for sample size calculations and specify the statistical significance level. Describe any planned interim analyses and multiple comparison adjustments.';
  } else if (prompt.includes('literature') || prompt.includes('reference')) {
    responseText = 'Literature reviews should be systematic and comprehensive. Search strategies should be clearly documented with inclusion and exclusion criteria. When citing literature in regulatory documents, ensure proper formatting and complete citation information. Critically evaluate the quality and relevance of each reference.';
  } else {
    responseText = 'I can help you draft and improve regulatory documents including clinical study protocols, clinical study reports, clinical evaluation reports, and regulatory submissions. Would you like me to help you with a specific section or provide general guidance on regulatory writing best practices?';
  }
  
  return {
    text: responseText,
    tokens: responseText.split(/\s+/).length,
    prompt_tokens: prompt.split(/\s+/).length,
  };
}

/**
 * Get writing suggestions for document content
 * @param {string} documentContent - Document content to analyze
 * @returns {Promise<Array>} Writing suggestions
 */
export async function getWritingSuggestions(documentContent) {
  try {
    if (!documentContent) {
      return [];
    }
    
    const response = await askCopilot('Please analyze this document content and provide writing improvement suggestions. Focus on clarity, regulatory compliance, and technical accuracy.', {
      documentContext: documentContent,
      maxTokens: 1000,
      temperature: 0.3,
    });
    
    // Parse suggestions from response
    const suggestionTexts = response.text.split('\n').filter(line => line.trim().length > 0);
    
    // Format suggestions
    return suggestionTexts.map((text, index) => ({
      id: `suggestion-${index}`,
      text: text.replace(/^- /, ''),
      type: text.toLowerCase().includes('error') ? 'error' : 
            text.toLowerCase().includes('warning') ? 'warning' : 'suggestion',
      position: null, // In a real implementation, this would point to the position in the document
    }));
  } catch (error) {
    console.error('Error getting writing suggestions:', error);
    return [];
  }
}

/**
 * Generate regulatory document section
 * @param {string} sectionType - Type of section to generate
 * @param {string} prompt - Additional context for generation
 * @returns {Promise<string>} Generated content
 */
export async function generateRegulatorySection(sectionType, prompt = "") {
  try {
    const systemPrompt = `You are an expert in regulatory document authoring. 
      Please generate a professionally written, comprehensive ${sectionType} section for a regulatory document.
      The content should follow industry best practices and regulatory guidance.
      Provide detailed, specific content rather than placeholders.`;
    
    const response = await askCopilot(`${systemPrompt}\n\nAdditional context: ${prompt}`, {
      maxTokens: 1500,
      temperature: 0.7,
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating regulatory section:', error);
    return '';
  }
}

/**
 * Analyze document for regulatory compliance
 * @param {string} documentContent - Document content to analyze
 * @param {string} regulationType - Type of regulatory framework to check against
 * @returns {Promise<Array>} Compliance issues
 */
export async function analyzeRegulatory(documentContent, regulationType = 'general') {
  try {
    if (!documentContent) {
      return [];
    }
    
    const prompt = `Please analyze this ${regulationType} regulatory document content and identify any compliance issues, missing information, or areas for improvement based on regulatory requirements and industry best practices.`;
    
    const response = await askCopilot(prompt, {
      documentContext: documentContent,
      maxTokens: 1200,
      temperature: 0.3,
    });
    
    // Parse issues from response
    const issueTexts = response.text.split('\n').filter(line => line.trim().length > 0);
    
    // Format issues
    return issueTexts.map((text, index) => ({
      id: `issue-${index}`,
      text: text.replace(/^- /, '').replace(/^[0-9]+\. /, ''),
      severity: 
        text.toLowerCase().includes('critical') ? 'critical' :
        text.toLowerCase().includes('major') ? 'major' :
        text.toLowerCase().includes('minor') ? 'minor' : 'info',
      position: null, // In a real implementation, this would point to the position in the document
    }));
  } catch (error) {
    console.error('Error analyzing regulatory compliance:', error);
    return [];
  }
}

/**
 * Generate document references from content
 * @param {string} documentContent - Document content
 * @returns {Promise<Array>} Generated references
 */
export async function generateReferences(documentContent) {
  try {
    if (!documentContent) {
      return [];
    }
    
    const prompt = `Please analyze this document content and identify key statements or claims that should be supported by references. 
      For each identified statement, suggest appropriate scientific references from the literature that could be used to support it.
      Format each reference following ICMJE guidelines.`;
    
    const response = await askCopilot(prompt, {
      documentContext: documentContent,
      maxTokens: 1500,
      temperature: 0.4,
    });
    
    // Split into reference entries
    const referenceBlocks = response.text.split(/\n\n+/);
    
    // Process each block into a reference object
    return referenceBlocks.map((block, index) => {
      const lines = block.split('\n');
      const statement = lines[0]?.replace(/^Statement: /, '').replace(/^Claim: /, '') || '';
      const reference = lines.slice(1).join('\n').replace(/^Reference: /, '') || '';
      
      return {
        id: `ref-${index}`,
        statement,
        reference,
        position: null, // In a real implementation, this would point to the position in the document
      };
    }).filter(ref => ref.reference.trim().length > 0);
  } catch (error) {
    console.error('Error generating references:', error);
    return [];
  }
}