/**
 * AI Service - Provides AI-powered functionality for various platform features
 */

import fetch from 'node-fetch';
import OpenAI from 'openai';

// Initialize OpenAI with API key from environment
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.warn('OpenAI client initialization failed, using mock instead:', error.message);
  // Create a mock implementation for development/testing
  openai = {
    chat: {
      completions: {
        create: async (params) => {
          console.log('MOCK OpenAI API call with params:', JSON.stringify(params, null, 2));
          return {
            choices: [
              {
                message: {
                  content: `This is a mock response. In production, this would be generated using the OpenAI API based on: ${JSON.stringify(params.messages)}`
                }
              }
            ]
          };
        }
      }
    }
  };
}

/**
 * Generate a narrative using AI
 * 
 * @param {Object} data Input data for narrative generation
 * @returns {Promise<Object>} Generated narrative
 */
export const generateNarrativeWithAI = async (data) => {
  try {
    console.log('Generating narrative with AI using data:', JSON.stringify(data, null, 2));
    
    // Format the prompt for better results
    const messages = [
      {
        role: 'system',
        content: `You are an expert medical writer specializing in clinical study reports (CSRs). 
        Generate a detailed patient case narrative based on the provided clinical information. 
        Follow ICH E3 guidelines for narrative structure and content.
        Use a professional, scientific tone appropriate for regulatory documentation.`
      },
      {
        role: 'user',
        content: `Generate a patient case narrative for the following information:
        
        Patient ID: ${data.patientId || 'Unknown'}
        Age: ${data.age || 'Unknown'}
        Gender: ${data.gender || 'Unknown'}
        Study Phase: ${data.studyPhase || 'Unknown'}
        Indication: ${data.indication || 'Unknown'}
        Intervention: ${data.intervention || 'Unknown'}
        
        Adverse Events: ${JSON.stringify(data.adverseEvents || [])}
        Medical History: ${JSON.stringify(data.medicalHistory || [])}
        Concomitant Medications: ${JSON.stringify(data.concomitantMedications || [])}
        
        Additional Context: ${data.additionalContext || 'None'}
        
        Please structure the narrative according to ICH E3 guidelines, including:
        1. Introduction with patient demographics
        2. Relevant medical history
        3. Study intervention details
        4. Description of adverse events with timing
        5. Clinical outcomes
        6. Investigator's assessment of causality
        7. Sponsor's assessment (if different)
        8. Brief conclusion`
      }
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0613', // Use the appropriate model version
      messages,
      temperature: 0.2, // Lower temperature for more consistent, clinical results
      max_tokens: 1000,
    });
    
    const narrativeText = response.choices[0].message.content;
    
    // Format the response
    return {
      narrative: narrativeText,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gpt-4-0613',
        guidelines: 'ICH E3',
        patientId: data.patientId,
        wordCount: narrativeText.split(' ').length
      }
    };
  } catch (error) {
    console.error('Error in generateNarrativeWithAI:', error);
    
    // Provide a fallback for development
    if (process.env.NODE_ENV !== 'production') {
      return {
        narrative: `[Mock narrative] This is a placeholder for a patient case narrative that would be generated using AI in production. The narrative would describe the clinical history and adverse events for patient ${data.patientId || 'Unknown'} who experienced ${(data.adverseEvents || []).map(ae => ae.name).join(', ') || 'unknown adverse events'}.`,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'mock',
          error: error.message,
          patientId: data.patientId
        }
      };
    }
    
    throw error;
  }
};

/**
 * Generate protocol recommendations using AI
 * 
 * @param {Object} protocolData Input data for protocol recommendations
 * @returns {Promise<Object>} Protocol recommendations
 */
export const generateProtocolRecommendations = async (protocolData) => {
  try {
    // Format the prompt for better results
    const messages = [
      {
        role: 'system',
        content: `You are an expert clinical trial designer with extensive knowledge of protocol development.
        Analyze the provided protocol information and generate specific recommendations to enhance:
        1. Study design and methodology
        2. Endpoint selection and statistical considerations
        3. Patient eligibility criteria
        4. Safety monitoring approaches
        Use evidence-based recommendations referring to regulatory guidelines where appropriate.`
      },
      {
        role: 'user',
        content: `Analyze this protocol and provide recommendations:
        
        Study Title: ${protocolData.title || 'Unknown'}
        Phase: ${protocolData.phase || 'Unknown'}
        Indication: ${protocolData.indication || 'Unknown'}
        Study Design: ${protocolData.design || 'Unknown'}
        Primary Endpoint: ${protocolData.primaryEndpoint || 'Unknown'}
        Secondary Endpoints: ${JSON.stringify(protocolData.secondaryEndpoints || [])}
        Inclusion Criteria: ${JSON.stringify(protocolData.inclusionCriteria || [])}
        Exclusion Criteria: ${JSON.stringify(protocolData.exclusionCriteria || [])}
        
        Please provide specific recommendations to enhance this protocol, including:
        1. Study design improvements
        2. Endpoint optimization
        3. Eligibility criteria refinement
        4. Safety monitoring enhancements
        
        For each recommendation, provide a brief rationale and, where applicable, 
        reference relevant regulatory guidelines (FDA, EMA, ICH, etc.).`
      }
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0613',
      messages,
      temperature: 0.3,
      max_tokens: 1200,
    });
    
    // Process and structure the response
    const rawRecommendations = response.choices[0].message.content;
    
    // Format the response
    return {
      recommendations: rawRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gpt-4-0613',
        protocolId: protocolData.id,
        indication: protocolData.indication
      }
    };
  } catch (error) {
    console.error('Error in generateProtocolRecommendations:', error);
    
    // Provide a fallback for development
    if (process.env.NODE_ENV !== 'production') {
      return {
        recommendations: `[Mock recommendations] This is a placeholder for AI-generated protocol recommendations that would be provided in production for the study titled "${protocolData.title || 'Unknown'}" for ${protocolData.indication || 'the specified indication'}.`,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'mock',
          error: error.message
        }
      };
    }
    
    throw error;
  }
};

/**
 * Compare protocols using AI
 * 
 * @param {Object} comparisonData Data containing protocols to compare
 * @returns {Promise<Object>} Comparison results
 */
export const compareProtocols = async (comparisonData) => {
  // Implementation similar to other methods
  // Using AI to compare protocol design elements between two or more protocols
  
  // For now, return a mock response
  return {
    comparison: "Protocol comparison would be generated here",
    similarities: ["Similar endpoint definitions", "Comparable safety monitoring"],
    differences: ["Different inclusion/exclusion criteria", "Variant dosing schedules"],
    recommendations: ["Consider harmonizing eligibility criteria", "Align endpoint definitions for cross-study analysis"]
  };
};

export default {
  generateNarrativeWithAI,
  generateProtocolRecommendations,
  compareProtocols
};