/**
 * Literature API Service
 * 
 * This service handles communication with the Literature API endpoints for
 * the CER module's Literature AI component.
 */

/**
 * Search PubMed for scientific literature
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query (device name)
 * @param {string} params.manufacturer - Optional manufacturer name to refine search
 * @param {number} params.limit - Maximum number of results to return
 * @returns {Promise<Object>} Search results with papers array
 */
export const searchPubMed = async ({ query, manufacturer = '', limit = 20 }) => {
  try {
    const response = await fetch('/api/literature/pubmed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, manufacturer, limit }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search PubMed');
    }

    return await response.json();
  } catch (error) {
    console.error('PubMed search error:', error);
    throw error;
  }
};

// Service object will be exported at the end of the file

/**
 * Search for scientific literature related to a product
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {string[]} params.sources - Sources to search (pubmed, googleScholar)
 * @param {Object} params.filters - Optional search filters
 * @param {number} params.filters.yearFrom - Start year for publication date filter
 * @param {number} params.filters.yearTo - End year for publication date filter
 * @param {string} params.filters.journalType - Journal type filter
 * @param {number} params.limit - Maximum number of results to return
 * @returns {Promise<Object>} Search results
 */
export const searchLiterature = async ({ query, sources = ['pubmed', 'googleScholar'], filters = {}, limit = 20 }) => {
  try {
    const response = await fetch('/api/literature/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, sources, filters, limit }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search for literature');
    }

    return await response.json();
  } catch (error) {
    console.error('Literature search error:', error);
    throw error;
  }
};

/**
 * Summarize text content from a scientific paper using GPT-4o
 * @param {Object} params - Summarization parameters
 * @param {string} params.text - Text to summarize (abstract or full text)
 * @param {string} params.context - Optional context to aid summarization (CER title or device info)
 * @param {Object} params.options - Optional summarization options
 * @param {string} params.options.format - Summary format ('bullet', 'paragraph', 'structured')
 * @param {number} params.options.maxLength - Maximum summary length
 * @returns {Promise<Object>} Summarized content
 */
export const summarizePaper = async ({ text, context, options = {} }) => {
  try {
    const response = await fetch('/api/literature/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context, options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to summarize paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Paper summarization error:', error);
    throw error;
  }
};

/**
 * Generate formatted citations for scientific papers
 * @param {Object} params - Citation parameters
 * @param {Array} params.papers - Array of paper objects to cite
 * @param {string} params.format - Citation format (vancouverStyle, apa, mla, harvard)
 * @param {boolean} params.numbered - Whether to use numbered citations
 * @returns {Promise<Object>} Generated citations
 */
export const generateCitations = async ({ papers, format = 'vancouverStyle', numbered = true }) => {
  try {
    const response = await fetch('/api/literature/generate-citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ papers, format, numbered }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate citations');
    }

    return await response.json();
  } catch (error) {
    console.error('Citation generation error:', error);
    throw error;
  }
};

/**
 * Generate a complete literature review section based on selected papers
 * @param {Object} params - Parameters for literature review generation
 * @param {Array} params.papers - Array of selected papers with summaries
 * @param {string} params.context - CER context (device name, indication, etc.)
 * @param {Object} params.options - Generation options
 * @param {string} params.options.focus - Focus area ('safety', 'efficacy', 'both')
 * @param {string} params.options.format - Format ('comprehensive', 'concise')
 * @returns {Promise<Object>} Generated literature review
 */
export const generateLiteratureReview = async ({ papers, context, options = {} }) => {
  try {
    const response = await fetch('/api/literature/generate-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ papers, context, options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate literature review');
    }

    return await response.json();
  } catch (error) {
    console.error('Literature review generation error:', error);
    throw error;
  }
};

/**
 * Upload and analyze PDF papers for literature review
 * @param {Object} params - Upload parameters
 * @param {File} params.file - PDF file to upload and analyze
 * @param {string} params.context - CER context (device name, indication, etc.)
 * @returns {Promise<Object>} Analyzed paper data
 */
export const analyzePaperPDF = async ({ file, context }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context || '');
    
    const response = await fetch('/api/literature/analyze-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze PDF');
    }

    return await response.json();
  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};

/**
 * Generate a relevance appraisal for a study in the literature review
 * @param {Object} study - The study to appraise
 * @param {string} deviceName - The name of the device being evaluated
 * @param {Array} inclusionCriteria - List of inclusion criteria for the review
 * @param {Array} exclusionCriteria - List of exclusion criteria for the review
 * @returns {Promise<Object>} Generated relevance appraisal
 */
export const generateRelevanceAppraisal = async (study, deviceName, inclusionCriteria = [], exclusionCriteria = []) => {
  try {
    const response = await fetch('/api/literature/appraise-relevance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        study, 
        deviceName, 
        inclusionCriteria, 
        exclusionCriteria 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate relevance appraisal');
    }

    return await response.json();
  } catch (error) {
    console.error('Relevance appraisal error:', error);
    // Use OpenAI directly if API endpoint fails
    return generateAIRelevanceAppraisal(study, deviceName, inclusionCriteria, exclusionCriteria);
  }
};

/**
 * Generate a bias assessment for a study in the literature review
 * @param {Object} study - The study to assess
 * @param {Array} biasDomains - List of bias domains to assess
 * @returns {Promise<Object>} Generated bias assessment
 */
export const generateBiasAssessment = async (study, biasDomains = []) => {
  try {
    const response = await fetch('/api/literature/assess-bias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        study, 
        biasDomains 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate bias assessment');
    }

    return await response.json();
  } catch (error) {
    console.error('Bias assessment error:', error);
    // Use OpenAI directly if API endpoint fails
    return generateAIBiasAssessment(study, biasDomains);
  }
};

/**
 * Generate a search summary for the literature review
 * @param {Object} reviewData - The literature review data
 * @returns {Promise<Object>} Generated search summary
 */
export const generateSearchSummary = async (reviewData) => {
  try {
    const response = await fetch('/api/literature/search-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate search summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Search summary error:', error);
    // Use OpenAI directly if API endpoint fails
    return generateAISearchSummary(reviewData);
  }
};

// Fallback AI generators using OpenAI directly if API endpoints fail
const generateAIRelevanceAppraisal = async (study, deviceName, inclusionCriteria, exclusionCriteria) => {
  try {
    // Use OpenAI API to generate relevance appraisal
    // This is a fallback for when the server endpoint is unavailable
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert in clinical literature appraisal with specialized knowledge of medical devices. 
            Your task is to assess the relevance of a scientific publication to a specific medical device evaluation.
            Provide a structured JSON response with scores and justifications.`
          },
          {
            role: "user",
            content: `Please appraise the relevance of this study for a clinical evaluation of "${deviceName}".
            
            Study Title: ${study.title}
            Authors: ${study.authors?.join(', ') || 'Unknown'}
            ${study.abstract ? `Abstract: ${study.abstract}` : ''}
            ${study.journal ? `Journal: ${study.journal}` : ''}
            ${study.publication_date ? `Publication Date: ${study.publication_date}` : ''}
            
            Inclusion Criteria:
            ${inclusionCriteria.map(criterion => `- ${criterion}`).join('\n')}
            
            Exclusion Criteria:
            ${exclusionCriteria.map(criterion => `- ${criterion}`).join('\n')}
            
            Assess the study's relevance on these criteria:
            1. Device relevance: How directly relevant is the study to the subject device?
            2. Population relevance: How well does the study population match the intended use population?
            3. Outcome relevance: How relevant are the studied outcomes to the intended performance and safety claims?
            4. Setting relevance: How representative is the clinical setting to real-world use?
            
            Rate each criterion from 1-5 where 1=Not Relevant, 3=Moderately Relevant, 5=Highly Relevant.
            Provide an overall relevance score and a summary of your assessment.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const responseData = await response.json();
    const appraisal = JSON.parse(responseData.choices[0].message.content);
    
    return {
      summary: appraisal.summary || 'No summary available',
      scores: appraisal.scores || {},
      criteriaAssessments: appraisal.criteriaAssessments || {},
      overallScore: appraisal.overallScore || 3,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI relevance appraisal generation error:', error);
    // Return a minimal default structure if all else fails
    return {
      summary: 'Could not generate automatic appraisal. Please assess manually.',
      scores: {},
      criteriaAssessments: {},
      overallScore: null,
      timestamp: new Date().toISOString()
    };
  }
};

const generateAIBiasAssessment = async (study, biasDomains) => {
  try {
    // Use OpenAI API to generate bias assessment
    // This is a fallback for when the server endpoint is unavailable
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert in clinical literature appraisal with specialized knowledge in assessing bias in scientific studies.
            Your task is to conduct a risk of bias assessment for a scientific publication.
            Provide a structured JSON response with risk levels and justifications for each bias domain.`
          },
          {
            role: "user",
            content: `Please conduct a risk of bias assessment for this study:
            
            Study Title: ${study.title}
            Authors: ${study.authors?.join(', ') || 'Unknown'}
            ${study.abstract ? `Abstract: ${study.abstract}` : ''}
            ${study.journal ? `Journal: ${study.journal}` : ''}
            ${study.publication_date ? `Publication Date: ${study.publication_date}` : ''}
            
            Assess the risk of bias in these domains:
            ${biasDomains.map(domain => `- ${domain.name}: ${domain.description}`).join('\n')}
            
            For each domain, assign a risk level of "low", "some_concerns", or "high", provide a brief justification, and include any notes.
            Also provide an overall risk of bias assessment and a summary of your assessment.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const responseData = await response.json();
    const assessment = JSON.parse(responseData.choices[0].message.content);
    
    return {
      summary: assessment.summary || 'No summary available',
      domainAssessments: assessment.domainAssessments || {},
      overallRisk: assessment.overallRisk || 'unclear',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI bias assessment generation error:', error);
    // Return a minimal default structure if all else fails
    return {
      summary: 'Could not generate automatic bias assessment. Please assess manually.',
      domainAssessments: {},
      overallRisk: 'unclear',
      timestamp: new Date().toISOString()
    };
  }
};

const generateAISearchSummary = async (reviewData) => {
  try {
    // Use OpenAI API to generate search summary
    // This is a fallback for when the server endpoint is unavailable
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert in clinical literature reviews with specialized knowledge of medical devices.
            Your task is to generate a comprehensive summary of a literature search methodology and results.
            Provide both narrative text and structured tables in HTML format.`
          },
          {
            role: "user",
            content: `Please generate a comprehensive summary of this literature search for ${reviewData.device || 'a medical device'}:
            
            Databases searched: ${reviewData.databases?.join(', ') || 'Not specified'}
            
            Search period: From ${reviewData.searchPeriod?.startDate || 'Not specified'} to ${reviewData.searchPeriod?.endDate || 'Not specified'}
            
            Search queries used:
            ${reviewData.searchQueries?.map(q => `- ${q.database}: ${q.query} (${q.results || 'Unknown'} results)`).join('\n') || 'Not specified'}
            
            Inclusion criteria:
            ${reviewData.inclusionCriteria?.map(c => `- ${c}`).join('\n') || 'Not specified'}
            
            Exclusion criteria:
            ${reviewData.exclusionCriteria?.map(c => `- ${c}`).join('\n') || 'Not specified'}
            
            PRISMA flow:
            - Records identified: ${reviewData.prismaFlow?.identified || 0}
            - Records screened: ${reviewData.prismaFlow?.screened || 0}
            - Records assessed for eligibility: ${reviewData.prismaFlow?.eligible || 0}
            - Studies included: ${reviewData.prismaFlow?.included || 0}
            
            Included studies:
            ${reviewData.selectedStudies?.map(s => 
              `- ${s.title} (${s.authors?.[0] || 'Unknown'} et al., ${new Date(s.publication_date).getFullYear() || 'Unknown'})
               Type: ${s.studyType || 'Not specified'}
               Relevance: ${s.overallRelevance ? (s.overallRelevance >= 4 ? 'High' : s.overallRelevance >= 3 ? 'Medium' : 'Low') : 'Not assessed'}
               Quality: ${s.overallQuality || 'Not assessed'}`
            ).join('\n') || 'No studies included'}
            
            Format your response as follows:
            1. A comprehensive narrative summary of the search strategy and results in HTML format
            2. A table of included studies with columns for Title, Year, Type, Relevance, and Quality
            3. Key findings and implications for the clinical evaluation
            
            Use proper HTML formatting for the content and tables.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const responseData = await response.json();
    const content = responseData.choices[0].message.content;
    
    // Extract HTML content and any tables
    const contentMatch = content.match(/<html>([\s\S]*?)<\/html>/) || content.match(/<body>([\s\S]*?)<\/body>/);
    const tableMatch = content.match(/<table>([\s\S]*?)<\/table>/g);
    
    // Create included studies table data
    const includedStudiesTable = reviewData.selectedStudies?.map(s => ({
      title: s.title || 'Unknown',
      year: s.publication_date ? new Date(s.publication_date).getFullYear() : 'Unknown',
      type: s.studyType || 'Not specified',
      relevance: s.overallRelevance ? (s.overallRelevance >= 4 ? 'High' : s.overallRelevance >= 3 ? 'Medium' : 'Low') : 'Not assessed',
      quality: s.overallQuality ? (s.overallQuality === 'high' ? 'High' : s.overallQuality === 'medium' ? 'Medium' : 'Low') : 'Not assessed'
    })) || [];
    
    return {
      content: contentMatch ? contentMatch[1] : content,
      tables: {
        included_studies: includedStudiesTable
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI search summary generation error:', error);
    // Return a minimal default structure if all else fails
    return {
      content: '<p>Could not generate automatic search summary. Please review manually.</p>',
      tables: {
        included_studies: []
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Export service object for easy imports (moved to end of file to fix circular dependency)
export const literatureAPIService = {
  searchPubMed,
  searchLiterature,
  summarizePaper,
  generateCitations,
  generateLiteratureReview,
  analyzePaperPDF,
  generateRelevanceAppraisal,
  generateBiasAssessment,
  generateSearchSummary
};
