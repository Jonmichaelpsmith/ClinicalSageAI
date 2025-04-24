/**
 * OpenAI Service for TrialSage CMC Module
 * 
 * This service integrates OpenAI's latest technologies to provide cutting-edge
 * AI capabilities for chemistry, manufacturing, and controls documentation.
 * 
 * Current integrations:
 * - GPT-4o for comprehensive text analysis and regulatory intelligence
 * - DALL-E 3 for chemical structure and manufacturing process visualization
 * - GPT-4o Vision for manufacturing equipment analysis and cGMP compliance assessment
 * - OpenAI Assistants API for persistent regulatory guidance
 */

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('OpenAI API Error:', error);
  
  // Provide meaningful error messages based on error type
  if (error.response) {
    // OpenAI API error response
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 429) {
      return {
        error: true,
        message: "Rate limit exceeded. Please try again shortly.",
        details: data
      };
    } else if (status === 401) {
      return {
        error: true,
        message: "Authentication error. Please check your API key.",
        details: data
      };
    } else {
      return {
        error: true,
        message: `API error: ${data.error?.message || 'Unknown error'}`,
        details: data
      };
    }
  } else {
    // Network or other error
    return {
      error: true,
      message: `Request error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Generate content for CMC sections using GPT-4o
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.section - The CTD section code (e.g., "S.2.2")
 * @param {string} params.title - Section title
 * @param {Object} params.context - Contextual data for the generation
 * @returns {Promise<Object>} Generated content and metadata
 */
export const generateCMCContent = async (params) => {
  try {
    // Simulated response for development
    // In production, this would be replaced with an actual API call
    console.log('Generating CMC content with OpenAI for:', params);
    
    const response = await fetch('/api/openai/generate-cmc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Analyze manufacturing process using GPT-4o
 * 
 * @param {Object} processData - Manufacturing process details
 * @returns {Promise<Object>} Analysis results and recommendations
 */
export const analyzeManufacturingProcess = async (processData) => {
  try {
    console.log('Analyzing manufacturing process with OpenAI:', processData);
    
    const response = await fetch('/api/openai/analyze-manufacturing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(processData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Assess regulatory compliance using GPT-4o
 * 
 * @param {Object} complianceData - Regulatory specifications to assess
 * @returns {Promise<Object>} Compliance assessment and recommendations
 */
export const assessRegulatoryCompliance = async (complianceData) => {
  try {
    console.log('Assessing regulatory compliance with OpenAI:', complianceData);
    
    const response = await fetch('/api/openai/assess-compliance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complianceData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Generate risk analysis using GPT-4o
 * 
 * @param {Object} riskData - Risk assessment context and parameters
 * @returns {Promise<Object>} Risk analysis and mitigation strategies
 */
export const generateRiskAnalysis = async (riskData) => {
  try {
    console.log('Generating risk analysis with OpenAI:', riskData);
    
    const response = await fetch('/api/openai/risk-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(riskData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Generate visualization of chemical or manufacturing process using DALL-E 3
 * 
 * @param {Object} visualizationParams - Parameters for visualization generation
 * @returns {Promise<Object>} Generated visualization data
 */
export const generateProcessVisualization = async (visualizationParams) => {
  try {
    console.log('Generating process visualization with DALL-E 3:', visualizationParams);
    
    const response = await fetch('/api/openai/visualization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(visualizationParams)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Analyze manufacturing equipment image using GPT-4o Vision
 * 
 * @param {string} base64Image - Base64-encoded image data
 * @param {Object} context - Additional context about the equipment
 * @returns {Promise<Object>} Analysis of equipment and compliance assessment
 */
export const analyzeEquipmentImage = async (base64Image, context = {}) => {
  try {
    console.log('Analyzing equipment image with GPT-4o Vision');
    
    const response = await fetch('/api/openai/analyze-equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        context
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Compare regulatory requirements across different markets
 * 
 * @param {Object} comparisonParams - Parameters for cross-market comparison
 * @returns {Promise<Object>} Comprehensive comparison and gap analysis
 */
export const compareMarketRequirements = async (comparisonParams) => {
  try {
    console.log('Comparing market requirements with GPT-4o:', comparisonParams);
    
    const response = await fetch('/api/openai/market-comparison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comparisonParams)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Generate global readiness report using GPT-4o
 * 
 * @param {Object} documentInventory - Inventory of available documentation
 * @param {Array} targetMarkets - List of target markets for analysis
 * @returns {Promise<Object>} Comprehensive readiness assessment
 */
export const generateGlobalReadinessReport = async (documentInventory, targetMarkets) => {
  try {
    console.log('Generating global readiness report with GPT-4o');
    
    const response = await fetch('/api/openai/global-readiness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentInventory,
        targetMarkets
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Simulate OpenAI response for development purposes
 * 
 * @param {string} endpoint - The endpoint to simulate
 * @param {Object} params - The parameters for the simulation
 * @returns {Promise<Object>} Simulated response
 */
export const simulateOpenAIResponse = async (endpoint, params) => {
  console.log(`Simulating OpenAI response for ${endpoint}:`, params);
  
  // Add artificial delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulation responses for development
  const simulations = {
    'analyze-equipment': {
      equipment: {
        type: 'Centrifugal Separator',
        model: 'Alpha Laval BTAX 215',
        components: [
          'Stainless steel bowl assembly (316L)',
          'CIP (Clean-In-Place) system',
          'Explosion-proof motor (Class 1, Div 1)',
          'Programmable control panel with HMI'
        ]
      },
      compliance: {
        gmpStatus: 'Partially Compliant',
        concerns: [
          'Visible gasket wear may compromise product contact surface integrity',
          'Equipment layout appears to limit access for cleaning validation',
          'Drainage configuration may create potential dead legs'
        ],
        recommendations: [
          'Replace bowl assembly gaskets with documented material certificates',
          'Implement improved accessibility for cleaning validation protocols',
          'Consider adding sanitary thermometer connections for process monitoring',
          'Update IQ/OQ documentation to reflect current GMP expectations'
        ]
      }
    },
    'global-readiness': {
      markets: {
        'FDA': {
          readiness: 82,
          strengths: ['Comprehensive validation documentation', 'Well-structured CTD format'],
          gaps: ['Nitrosamine risk assessment needs updating'],
          criticalItems: []
        },
        'EMA': {
          readiness: 65,
          strengths: ['QP declaration properly formatted'],
          gaps: ['Starting material justification needs strengthening', 'Elemental impurities assessment incomplete'],
          criticalItems: ['Complete ICH Q3D assessment for catalysts']
        },
        'PMDA': {
          readiness: 43,
          strengths: ['Translation quality meets requirements'],
          gaps: ['Insufficient API starting material documentation', 'Incomplete stability data'],
          criticalItems: ['Expand API starting material documentation', 'Complete stability studies']
        },
        'NMPA': {
          readiness: 51,
          strengths: ['Local agent properly established'],
          gaps: ['Manufacturing process validation incomplete', 'Local standards specifications missing'],
          criticalItems: ['Complete process validation for critical steps']
        },
        'Health Canada': {
          readiness: 78,
          strengths: ['Bilingual labeling compliant', 'Quality Overall Summary well structured'],
          gaps: ['Quality Overall Summary needs minor updates'],
          criticalItems: []
        }
      },
      actionItems: [
        {
          id: 'ai-001',
          title: 'API Starting Material Documentation (PMDA)',
          description: 'Additional documentation required for API starting material selection and justification, including synthetic route options and impurity profiles.',
          priority: 'high',
          market: 'PMDA',
          dueDate: '2025-05-15'
        },
        {
          id: 'ai-002',
          title: 'Elemental Impurities Assessment (EMA)',
          description: 'Elemental impurities assessment does not meet ICH Q3D requirements for risk assessment of potential catalyst residues.',
          priority: 'high',
          market: 'EMA',
          dueDate: '2025-06-03'
        },
        {
          id: 'ai-003',
          title: 'Manufacturing Process Validation (NMPA)',
          description: 'Additional process validation data required for critical manufacturing steps, with specific focus on NMPA requirements for sterilization validation.',
          priority: 'high',
          market: 'NMPA',
          dueDate: '2025-05-22'
        }
      ],
      overview: {
        commonGaps: ['Stability data presentation inconsistencies between modules', 'Specification justifications need harmonization'],
        potentialRisks: ['Different analytical methods across regions may delay approvals', 'Starting material strategies differ between US and EU submissions'],
        recommendations: [
          'Prioritize PMDA documentation gaps for fastest global alignment',
          'Harmonize stability protocols across all regions',
          'Consider joint scientific advice meeting with FDA and EMA'
        ]
      }
    }
  };
  
  return simulations[endpoint] || { 
    success: true, 
    message: 'Simulated response (generic)',
    data: {
      result: 'This is a simulated response for development purposes.',
      parameters: params
    }
  };
};

/**
 * Generate batch documentation using GPT-4o
 * 
 * @param {Object} batchData - Critical batch process parameters
 * @returns {Promise<Object>} Generated batch documentation
 */
export const generateBatchDocumentation = async (batchData) => {
  try {
    console.log('Generating batch documentation with GPT-4o:', batchData);
    
    const response = await fetch('/api/openai/batch-documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batchData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Generate Method Validation Protocol using GPT-4o
 * 
 * @param {Object} methodData - Analytical method parameters
 * @returns {Promise<Object>} Generated method validation protocol
 */
export const generateMethodValidationProtocol = async (methodData) => {
  try {
    console.log('Generating method validation protocol with GPT-4o:', methodData);
    
    const response = await fetch('/api/openai/method-validation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(methodData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Generate regulatory response using GPT-4o Assistant
 * 
 * @param {string} query - The regulatory query
 * @returns {Promise<Object>} Regulatory assistant response
 */
export const queryRegulatoryAssistant = async (query) => {
  try {
    console.log('Querying regulatory assistant with GPT-4o:', query);
    
    const response = await fetch('/api/openai/regulatory-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};