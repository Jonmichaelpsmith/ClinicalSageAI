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
 * @param {string} params.filters.journalImpactFactor - Journal impact factor filter
 * @param {string} params.filters.studyType - Study type filter
 * @param {boolean} params.useVectorSearch - Whether to use vector-based semantic search
 * @param {number} params.limit - Maximum number of results to return
 * @param {string} params.organizationId - Optional organization ID for access control
 * @returns {Promise<Object>} Search results
 */
export const searchLiterature = async ({ 
  query, 
  productCode = '',
  intendedUse = '',
  deviceClass = '',
  sources = ['pubmed', 'googleScholar'], 
  filters = {}, 
  useVectorSearch = true,
  limit = 20,
  organizationId
}) => {
  try {
    // Prepare the search parameters including advanced filtering options
    const searchParams = {
      query,
      productCode,
      intendedUse,
      deviceClass,
      sources,
      filters,
      useVectorSearch,
      limit,
      organizationId: organizationId || ''
    };
    
    // Log search parameters for debugging
    console.log('Searching literature with parameters:', {
      ...searchParams,
      query: searchParams.query.substring(0, 50) + (searchParams.query.length > 50 ? '...' : ''),
      intendedUse: searchParams.intendedUse?.substring(0, 50) + (searchParams.intendedUse?.length > 50 ? '...' : '')
    });
    
    const response = await fetch('/api/literature/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search for literature');
    }

    const data = await response.json();
    
    // Enhance results with calculated relevance scores if not already present
    if (data && data.results && Array.isArray(data.results)) {
      // Ensure all results have a relevance score for consistent UI display
      data.results = data.results.map(item => ({
        ...item,
        relevanceScore: item.relevanceScore || item.similarity || item.score || 0.7
      }));
      
      // Sort by relevance score if vector search was used
      if (useVectorSearch) {
        data.results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      
      return {
        success: true,
        data: data.results,
        metadata: {
          searchTerms: searchParams.query,
          totalResults: data.results.length,
          searchDate: new Date().toISOString(),
          searchType: useVectorSearch ? 'semantic_vector' : 'keyword',
          dataSources: sources
        }
      };
    }
    
    return {
      success: true,
      data: [],
      metadata: {
        searchTerms: searchParams.query,
        totalResults: 0,
        searchDate: new Date().toISOString(),
        searchType: useVectorSearch ? 'semantic_vector' : 'keyword', 
        dataSources: sources
      }
    };
  } catch (error) {
    console.error('Literature search error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
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
 * Uses GPT-4o directly for enhanced analysis and consistent quality results.
 * 
 * @param {Object} study - The study to appraise
 * @param {string} deviceName - The name of the device being evaluated
 * @param {Array} inclusionCriteria - List of inclusion criteria for the review
 * @param {Array} exclusionCriteria - List of exclusion criteria for the review
 * @returns {Promise<Object>} Generated relevance appraisal
 */
export const generateRelevanceAppraisal = async (study, deviceName, inclusionCriteria = [], exclusionCriteria = []) => {
  try {
    console.log('Generating relevance appraisal using GPT-4o AI', deviceName);
    
    // Direct GPT-4o integration for consistent high-quality appraisals
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
            content: `You are an expert in clinical literature appraisal with specialized knowledge of medical devices 
            and EU MDR/MEDDEV 2.7/1 Rev 4 requirements for clinical evaluation reports. 
            Your task is to assess the relevance of a scientific publication to a specific medical device evaluation
            in accordance with regulatory guidelines for CERs.
            Provide a structured JSON response with scores and justifications.`
          },
          {
            role: "user",
            content: `Please appraise the relevance of this study for a clinical evaluation of "${deviceName}" according to MEDDEV 2.7/1 Rev 4 requirements.
            
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
            
            For this assessment, follow EU MDR best practices by:
            - Ensuring device equivalence considerations are thoroughly analyzed
            - Evaluating clinical data quality against Annex XIV requirements
            - Assessing if the evidence supports intended purpose claims
            
            Provide an overall relevance score and a detailed summary of your assessment including regulatory considerations.`
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
    
    // Log successful appraisal generation
    console.log('GPT-4o appraisal generated successfully');
    
    return {
      summary: appraisal.summary || 'No summary available',
      scores: appraisal.scores || {},
      criteriaAssessments: appraisal.criteriaAssessments || {},
      overallScore: appraisal.overallScore || 3,
      timestamp: new Date().toISOString(),
      aiProvider: 'gpt-4o',
      regulatoryFramework: 'EU MDR (MEDDEV 2.7/1 Rev 4)'
    };
  } catch (error) {
    console.error('AI relevance appraisal generation error:', error);
    
    // Re-attempt with backend API as backup
    try {
      console.log('Attempting to use server API for relevance appraisal');
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
    } catch (backupError) {
      console.error('Backup server appraisal failed:', backupError);
      // No fallbacks - propagate the error to be handled by UI components
      throw backupError;
    }
  }
};

/**
 * Generate a bias assessment for a study in the literature review
 * Uses GPT-4o directly for enhanced analysis and consistent quality results.
 * 
 * @param {Object} study - The study to assess
 * @param {Array} biasDomains - List of bias domains to assess
 * @returns {Promise<Object>} Generated bias assessment
 */
export const generateBiasAssessment = async (study, biasDomains = []) => {
  try {
    console.log('Generating bias assessment using GPT-4o AI');
    
    // Direct GPT-4o integration for consistent high-quality assessments
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
            content: `You are an expert in clinical literature appraisal with specialized knowledge in assessing bias in scientific studies
            according to the latest methodological standards (Cochrane RoB 2.0, ROBINS-I, etc.).
            Your task is to conduct a detailed risk of bias assessment for a clinical study in the context of a Clinical Evaluation Report 
            following EU MDR (MEDDEV 2.7/1 Rev 4) requirements.
            Provide a structured JSON response with risk levels and detailed justifications for each bias domain.`
          },
          {
            role: "user",
            content: `Please conduct a comprehensive risk of bias assessment for this study:
            
            Study Title: ${study.title}
            Authors: ${study.authors?.join(', ') || 'Unknown'}
            ${study.abstract ? `Abstract: ${study.abstract}` : ''}
            ${study.journal ? `Journal: ${study.journal}` : ''}
            ${study.publication_date ? `Publication Date: ${study.publication_date}` : ''}
            
            Assess the risk of bias in these domains:
            ${biasDomains.map(domain => `- ${domain.name}: ${domain.description}`).join('\n')}
            
            For each domain:
            1. Assign a risk level of "low", "some_concerns", or "high"
            2. Provide a detailed justification based on EU MDR requirements
            3. Include specific observations from the study
            4. Recommend potential mitigations for identified biases
            
            Also provide:
            - An overall risk of bias assessment
            - A summary of your assessment with regulatory context
            - Quality assessment against GRADE criteria
            - Implications for data validity in a Clinical Evaluation Report`
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
    
    // Log successful assessment generation
    console.log('GPT-4o bias assessment generated successfully');
    
    return {
      summary: assessment.summary || 'No summary available',
      domainAssessments: assessment.domainAssessments || {},
      overallRisk: assessment.overallRisk || 'unclear',
      gradeAssessment: assessment.gradeAssessment || null,
      regulatoryImplications: assessment.regulatoryImplications || null,
      timestamp: new Date().toISOString(),
      aiProvider: 'gpt-4o',
      methodologyStandard: 'Cochrane RoB 2.0'
    };
  } catch (error) {
    console.error('AI bias assessment generation error:', error);
    
    // Re-attempt with backend API as backup
    try {
      console.log('Attempting to use server API for bias assessment');
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
    } catch (backupError) {
      console.error('Backup server assessment failed:', backupError);
      // Return a minimal default structure if all else fails
      return {
        summary: 'Could not generate automatic bias assessment. Please assess manually.',
        domainAssessments: {},
        overallRisk: 'unclear',
        timestamp: new Date().toISOString()
      };
    }
  }
};

/**
 * Generate a search summary for the literature review
 * Uses GPT-4o directly for enhanced analysis and consistent quality results.
 * 
 * @param {Object} reviewData - The literature review data
 * @returns {Promise<Object>} Generated search summary
 */
export const generateSearchSummary = async (reviewData) => {
  try {
    console.log('Generating literature search summary using GPT-4o AI');
    
    // Extract the relevant data for the summary
    const {
      title,
      device,
      author,
      date,
      databases,
      searchPeriod,
      searchQueries,
      inclusionCriteria,
      exclusionCriteria,
      selectedStudies,
      prismaFlow
    } = reviewData;
    
    // Direct GPT-4o integration for comprehensive search summaries
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
            content: `You are an expert in clinical literature review and medical device evaluation
            with specialized knowledge of EU MDR (MEDDEV 2.7/1 Rev 4) requirements.
            Your task is to create a comprehensive search strategy summary for a Clinical Evaluation Report.
            Provide a structured JSON response that meets regulatory requirements for documenting literature search methodology.`
          },
          {
            role: "user",
            content: `Please generate a comprehensive search methodology summary for this literature review:
            
            Title: ${title || 'Literature Review for Clinical Evaluation Report'}
            Device: ${device || 'Medical Device'}
            Author: ${author || 'Clinical Evaluator'}
            Date: ${date || new Date().toISOString().split('T')[0]}
            
            Search Period:
            From: ${searchPeriod?.startDate || 'Not specified'}
            To: ${searchPeriod?.endDate || 'Not specified'}
            
            Databases searched:
            ${databases?.map(dbId => {
              const db = DATABASES.find(d => d.id === dbId);
              return db ? `- ${db.name}: ${db.description}` : `- ${dbId}`;
            }).join('\n') || 'No databases specified'}
            
            Search Queries:
            ${searchQueries?.map(q => 
              `- Database: ${q.database}, Query: "${q.query}", Results: ${q.results}, Date: ${q.date}`
            ).join('\n') || 'No search queries specified'}
            
            Inclusion Criteria:
            ${inclusionCriteria?.filter(c => c.enabled).map(c => `- ${c.criterion}`).join('\n') || 'No inclusion criteria specified'}
            
            Exclusion Criteria:
            ${exclusionCriteria?.filter(c => c.enabled).map(c => `- ${c.criterion}`).join('\n') || 'No exclusion criteria specified'}
            
            PRISMA Flow Data:
            - Records identified: ${prismaFlow?.identified || 0}
            - Records screened: ${prismaFlow?.screened || 0}
            - Records assessed for eligibility: ${prismaFlow?.eligible || 0}
            - Studies included in the review: ${prismaFlow?.included || 0}
            
            Selected Studies:
            ${selectedStudies?.map((s, i) => 
              `${i+1}. ${s.title} (${s.authors?.join(', ') || 'Unknown'}, ${s.publication_date || 'Unknown date'})`
            ).join('\n') || 'No studies selected'}
            
            Based on this information, produce:
            1. A formatted search methodology text for inclusion in a CER according to MEDDEV 2.7/1 Rev 4
            2. An analysis of search completeness and potential gaps
            3. Recommendations for improving the search if needed
            4. A conclusion about the adequacy of the search for regulatory compliance
            
            Include appropriate regulatory language and ensure the summary would satisfy Notified Body scrutiny.`
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
    const summary = JSON.parse(responseData.choices[0].message.content);
    
    // Log successful summary generation
    console.log('GPT-4o search summary generated successfully');
    
    return {
      methodologyText: summary.methodologyText || 'No methodology text available',
      analysis: summary.analysis || 'No analysis available',
      recommendations: summary.recommendations || [],
      conclusion: summary.conclusion || 'No conclusion available',
      timestamp: new Date().toISOString(),
      aiProvider: 'gpt-4o',
      regulatoryFramework: 'EU MDR (MEDDEV 2.7/1 Rev 4)'
    };
  } catch (error) {
    console.error('AI search summary generation error:', error);
    
    // Re-attempt with backend API as backup
    try {
      console.log('Attempting to use server API for search summary');
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
    } catch (backupError) {
      console.error('Backup server summary generation failed:', backupError);
      // Use fallback if all else fails
      return generateAISearchSummary(reviewData);
    }
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
