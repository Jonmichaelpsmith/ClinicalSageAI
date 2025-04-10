/**
 * Research Companion Service for TrialSage
 * 
 * This service provides an AI-powered research assistant that can answer questions
 * about clinical trials, find relevant trials, compare studies, and provide insights
 * using natural language processing.
 */

import { db } from './db';
import { eq, and, like, ilike, desc, asc, or, inArray, exists, sql, count } from 'drizzle-orm';
import { csrReports, csrDetails } from '@shared/schema';
import { HFModel, queryHuggingFace } from './huggingface-service';

interface QueryResult {
  query: string;
  queryType: QueryType;
  results: any[];
  analysis: string;
  suggestedQueries: string[];
}

enum QueryType {
  FIND_TRIALS = 'find_trials',
  COMPARE_TRIALS = 'compare_trials',
  ANALYZE_ENDPOINT = 'analyze_endpoint',
  ANALYZE_INDICATION = 'analyze_indication',
  ANALYZE_SPONSOR = 'analyze_sponsor',
  REGULATORY_QUESTION = 'regulatory_question',
  GENERAL_QUESTION = 'general_question',
  PROTOCOL_ADVICE = 'protocol_advice',
  STATISTICAL_QUESTION = 'statistical_question'
}

/**
 * Main entry point for processing a natural language query about clinical trials
 * 
 * @param query The natural language query from the user
 * @param context Additional context about the user or their interests
 * @returns Structured results and AI-generated analysis
 */
export async function processResearchQuery(
  query: string,
  context: {
    userId?: number;
    recentQueries?: string[];
    favoriteIndications?: string[];
    favoriteSponsor?: string;
  } = {}
): Promise<QueryResult> {
  try {
    // Step 1: Classify the query type to determine how to process it
    const queryType = await classifyQueryIntent(query);
    
    // Step 2: Process the query based on its type
    let results: any[] = [];
    
    switch (queryType) {
      case QueryType.FIND_TRIALS:
        results = await findRelevantTrials(query);
        break;
        
      case QueryType.COMPARE_TRIALS:
        const trialIds = await extractTrialIdsFromQuery(query);
        results = await compareTrials(trialIds);
        break;
        
      case QueryType.ANALYZE_ENDPOINT:
        const { endpoint, indication } = await extractEndpointInfo(query);
        results = await analyzeEndpoint(endpoint, indication);
        break;
        
      case QueryType.ANALYZE_INDICATION:
        const indicationToAnalyze = await extractIndicationFromQuery(query);
        results = await analyzeIndication(indicationToAnalyze);
        break;
        
      case QueryType.ANALYZE_SPONSOR:
        const sponsorToAnalyze = await extractSponsorFromQuery(query);
        results = await analyzeSponsor(sponsorToAnalyze);
        break;
        
      case QueryType.REGULATORY_QUESTION:
        results = await findRegulatoryGuidance(query);
        break;
        
      case QueryType.STATISTICAL_QUESTION:
        results = await handleStatisticalQuestion(query);
        break;
        
      case QueryType.PROTOCOL_ADVICE:
        results = await provideProtocolAdvice(query);
        break;
        
      case QueryType.GENERAL_QUESTION:
      default:
        // For general questions, we'll provide a more conversational response
        results = await handleGeneralQuestion(query);
    }
    
    // Step 3: Generate an AI analysis of the results
    const analysis = await generateAnalysis(query, results, queryType);
    
    // Step 4: Generate suggested follow-up questions
    const suggestedQueries = await generateSuggestedQueries(query, results, queryType);
    
    // Step 5: Save the query for future reference if user is logged in
    if (context.userId) {
      await saveUserQuery(context.userId, query, queryType, results.length);
    }
    
    return {
      query,
      queryType, 
      results,
      analysis,
      suggestedQueries
    };
  } catch (error) {
    console.error('Error processing research query:', error);
    throw error;
  }
}

/**
 * Classify the intent of a user's query to determine the best processing approach
 * 
 * @param query The natural language query
 * @returns The classified query type
 */
async function classifyQueryIntent(query: string): Promise<QueryType> {
  try {
    const classificationPrompt = `
    Classify the following clinical trial research question into exactly ONE of these categories:
    
    - FIND_TRIALS: Questions seeking specific clinical trials
    - COMPARE_TRIALS: Questions comparing two or more trials
    - ANALYZE_ENDPOINT: Questions about specific endpoints or outcome measures
    - ANALYZE_INDICATION: Questions about disease areas or indications
    - ANALYZE_SPONSOR: Questions about trial sponsors or companies
    - REGULATORY_QUESTION: Questions about regulatory guidance or requirements
    - PROTOCOL_ADVICE: Questions seeking advice on protocol design
    - STATISTICAL_QUESTION: Questions about statistical methods or analyses
    - GENERAL_QUESTION: General questions about clinical trials
    
    Question: "${query}"
    
    Response format: Return only the category name without explanation or additional text.
    `;
    
    const response = await queryHuggingFace(classificationPrompt, HFModel.MISTRAL_7B, 50, 0.1);
    const classification = response.trim().toUpperCase();
    
    // Match the response to a valid query type or default to GENERAL_QUESTION
    for (const type in QueryType) {
      if (classification.includes(type)) {
        return QueryType[type as keyof typeof QueryType];
      }
    }
    
    return QueryType.GENERAL_QUESTION;
  } catch (error) {
    console.error('Error classifying query intent:', error);
    return QueryType.GENERAL_QUESTION;
  }
}

/**
 * Find clinical trials relevant to a natural language query
 * 
 * @param query The search query
 * @returns List of relevant trials
 */
async function findRelevantTrials(query: string): Promise<any[]> {
  try {
    // Step 1: Extract key search parameters from the query
    const extractionPrompt = `
    Extract search parameters from this clinical trial query. 
    Return a JSON object with these fields (leave empty if not mentioned):
    {
      "indication": "disease or condition",
      "phase": "trial phase",
      "sponsor": "trial sponsor",
      "drug": "intervention name",
      "status": "trial status",
      "yearStart": "start year if mentioned",
      "yearEnd": "end year if mentioned"
    }
    
    Query: "${query}"
    
    Return only valid JSON without any explanations.
    `;
    
    const extractionResponse = await queryHuggingFace(extractionPrompt, HFModel.STARLING, 1024, 0.2);
    
    // Parse the extraction results
    let params;
    try {
      // Find and extract JSON from the response
      const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        params = JSON.parse(jsonMatch[0]);
      } else {
        params = {};
      }
    } catch (error) {
      console.error('Error parsing search parameters:', error);
      params = {};
    }
    
    // Step 2: Build and execute the database query
    let dbQuery = db.select({
      id: csrReports.id,
      title: csrReports.title,
      sponsor: csrReports.sponsor,
      indication: csrReports.indication,
      phase: csrReports.phase,
      status: csrReports.status,
      date: csrReports.date,
      drugName: csrReports.drug_name,
      nctrialId: csrReports.nctrial_id,
      region: csrReports.region
    })
    .from(csrReports)
    .where(eq(csrReports.deletedAt, null))
    .limit(20);
    
    // Add filters based on extracted parameters
    if (params.indication) {
      dbQuery = dbQuery.where(ilike(csrReports.indication, `%${params.indication}%`));
    }
    
    if (params.phase) {
      dbQuery = dbQuery.where(ilike(csrReports.phase, `%${params.phase}%`));
    }
    
    if (params.sponsor) {
      dbQuery = dbQuery.where(ilike(csrReports.sponsor, `%${params.sponsor}%`));
    }
    
    if (params.drug) {
      dbQuery = dbQuery.where(ilike(csrReports.drug_name, `%${params.drug}%`));
    }
    
    if (params.status) {
      dbQuery = dbQuery.where(ilike(csrReports.status, `%${params.status}%`));
    }
    
    if (params.yearStart && params.yearEnd) {
      const startDate = `${params.yearStart}-01-01`;
      const endDate = `${params.yearEnd}-12-31`;
      dbQuery = dbQuery.where(
        and(
          sql`${csrReports.date} >= ${startDate}`,
          sql`${csrReports.date} <= ${endDate}`
        )
      );
    } else if (params.yearStart) {
      const startDate = `${params.yearStart}-01-01`;
      dbQuery = dbQuery.where(sql`${csrReports.date} >= ${startDate}`);
    } else if (params.yearEnd) {
      const endDate = `${params.yearEnd}-12-31`;
      dbQuery = dbQuery.where(sql`${csrReports.date} <= ${endDate}`);
    }
    
    // Execute the query
    const results = await dbQuery;
    
    // Step 3: For each result, fetch additional details
    const enhancedResults = await Promise.all(
      results.map(async (trial) => {
        // Get trial details
        const [details] = await db
          .select()
          .from(csr_details)
          .where(eq(csr_details.report_id, trial.id));
        
        return {
          ...trial,
          details: details || null
        };
      })
    );
    
    return enhancedResults;
  } catch (error) {
    console.error('Error finding relevant trials:', error);
    return [];
  }
}

/**
 * Extract trial IDs from a comparison query
 * 
 * @param query The query that wants to compare trials
 * @returns Array of trial IDs to compare
 */
async function extractTrialIdsFromQuery(query: string): Promise<number[]> {
  try {
    // First, try to extract explicit trial IDs if mentioned
    const idExtractionPrompt = `
    Extract all clinical trial identifiers mentioned in this query.
    Return them as a JSON array of strings. Only include actual identifiers, 
    not general descriptions of trials.
    
    Query: "${query}"
    
    Example output format: ["NCT0123456", "HC-5001", "3"]
    Return only the JSON array without any explanations.
    `;
    
    const extractionResponse = await queryHuggingFace(idExtractionPrompt, HFModel.STARLING, 512, 0.2);
    
    // Try to parse the IDs
    let trialIds: string[] = [];
    try {
      // Find and extract JSON array from the response
      const jsonMatch = extractionResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        trialIds = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing trial IDs:', error);
      trialIds = [];
    }
    
    // If we have explicit IDs, look them up
    if (trialIds.length > 0) {
      const results = await db
        .select({ id: csr_reports.id })
        .from(csr_reports)
        .where(
          or(
            inArray(csr_reports.id, trialIds.filter(id => !isNaN(Number(id))).map(id => Number(id))),
            inArray(csr_reports.nctrial_id, trialIds)
          )
        );
      
      return results.map(r => r.id);
    }
    
    // If no explicit IDs, try to find trials by description
    const extractionPrompt = `
    Extract search parameters to identify clinical trials from this comparison query. 
    Return a JSON object with arrays for each trial mentioned:
    {
      "trials": [
        {
          "indication": "disease or condition",
          "sponsor": "trial sponsor",
          "drug": "intervention name",
          "phase": "trial phase",
          "description": "any other identifying information"
        }
      ]
    }
    
    Query: "${query}"
    
    Return only valid JSON without any explanations.
    `;
    
    const descriptiveResponse = await queryHuggingFace(extractionPrompt, HFModel.STARLING, 1024, 0.3);
    
    // Parse the trial descriptions
    let trialDescriptions;
    try {
      // Find and extract JSON from the response
      const jsonMatch = descriptiveResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        trialDescriptions = JSON.parse(jsonMatch[0]);
      } else {
        trialDescriptions = { trials: [] };
      }
    } catch (error) {
      console.error('Error parsing trial descriptions:', error);
      trialDescriptions = { trials: [] };
    }
    
    // If we have descriptions, search for each trial
    const ids: number[] = [];
    
    if (trialDescriptions.trials && trialDescriptions.trials.length > 0) {
      for (const trialDesc of trialDescriptions.trials) {
        let trialQuery = db
          .select({ id: csr_reports.id })
          .from(csr_reports)
          .where(eq(csr_reports.deleted_at, null))
          .limit(1);
        
        if (trialDesc.indication) {
          trialQuery = trialQuery.where(ilike(csr_reports.indication, `%${trialDesc.indication}%`));
        }
        
        if (trialDesc.sponsor) {
          trialQuery = trialQuery.where(ilike(csr_reports.sponsor, `%${trialDesc.sponsor}%`));
        }
        
        if (trialDesc.drug) {
          trialQuery = trialQuery.where(ilike(csr_reports.drug_name, `%${trialDesc.drug}%`));
        }
        
        if (trialDesc.phase) {
          trialQuery = trialQuery.where(ilike(csr_reports.phase, `%${trialDesc.phase}%`));
        }
        
        const result = await trialQuery;
        if (result.length > 0) {
          ids.push(result[0].id);
        }
      }
    }
    
    // If we still don't have enough trials, just return the two most recent
    if (ids.length < 2) {
      const recentTrials = await db
        .select({ id: csr_reports.id })
        .from(csr_reports)
        .where(eq(csr_reports.deleted_at, null))
        .orderBy(desc(csr_reports.date))
        .limit(2);
      
      for (const trial of recentTrials) {
        if (!ids.includes(trial.id)) {
          ids.push(trial.id);
        }
      }
    }
    
    return ids;
  } catch (error) {
    console.error('Error extracting trial IDs from query:', error);
    
    // Fallback to returning the two most recent trials
    const recentTrials = await db
      .select({ id: csr_reports.id })
      .from(csr_reports)
      .where(eq(csr_reports.deleted_at, null))
      .orderBy(desc(csr_reports.date))
      .limit(2);
    
    return recentTrials.map(t => t.id);
  }
}

/**
 * Compare multiple clinical trials
 * 
 * @param trialIds IDs of trials to compare
 * @returns Comparison results
 */
async function compareTrials(trialIds: number[]): Promise<any[]> {
  try {
    // Ensure we have at least 2 trials to compare
    if (trialIds.length < 2) {
      throw new Error('At least two trials are needed for comparison');
    }
    
    // Get full trial data for each ID
    const trials = await Promise.all(
      trialIds.map(async (id) => {
        const [trialData] = await db
          .select()
          .from(csr_reports)
          .where(eq(csr_reports.id, id));
        
        const [trialDetails] = await db
          .select()
          .from(csr_details)
          .where(eq(csr_details.report_id, id));
        
        return {
          ...trialData,
          details: trialDetails || {}
        };
      })
    );
    
    // Structure the comparison
    return [
      {
        type: 'comparison',
        trials: trials,
        comparisonPoints: [
          {
            name: 'Basic Information',
            attributes: [
              { name: 'Title', values: trials.map(t => t.title) },
              { name: 'Sponsor', values: trials.map(t => t.sponsor) },
              { name: 'Phase', values: trials.map(t => t.phase) },
              { name: 'Status', values: trials.map(t => t.status) },
              { name: 'Drug', values: trials.map(t => t.drug_name) }
            ]
          },
          {
            name: 'Design',
            attributes: [
              { 
                name: 'Study Design', 
                values: trials.map(t => t.details?.study_design || 'Not specified') 
              },
              { 
                name: 'Primary Objective', 
                values: trials.map(t => t.details?.primary_objective || 'Not specified') 
              }
            ]
          },
          {
            name: 'Eligibility',
            attributes: [
              { 
                name: 'Inclusion Criteria', 
                values: trials.map(t => t.details?.inclusion_criteria || 'Not specified') 
              },
              { 
                name: 'Exclusion Criteria', 
                values: trials.map(t => t.details?.exclusion_criteria || 'Not specified') 
              }
            ]
          },
          {
            name: 'Results',
            attributes: [
              { 
                name: 'Results Summary', 
                values: trials.map(t => {
                  if (t.details?.results) {
                    if (typeof t.details.results === 'string') {
                      return t.details.results;
                    } else {
                      return JSON.stringify(t.details.results);
                    }
                  }
                  return 'No results available';
                }) 
              }
            ]
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error comparing trials:', error);
    return [];
  }
}

/**
 * Extract endpoint information from a query
 * 
 * @param query The query about endpoints
 * @returns Structured endpoint information
 */
async function extractEndpointInfo(query: string): Promise<{ endpoint: string, indication?: string }> {
  try {
    const extractionPrompt = `
    Extract the endpoint (outcome measure) and indication (disease) mentioned in this query.
    Return a JSON object with these fields:
    {
      "endpoint": "the specific endpoint or outcome measure mentioned",
      "indication": "the disease or condition mentioned (if any)"
    }
    
    Query: "${query}"
    
    Return only valid JSON without any explanations.
    `;
    
    const extractionResponse = await queryHuggingFace(extractionPrompt, HFModel.STARLING, 512, 0.2);
    
    // Parse the extraction results
    let params;
    try {
      // Find and extract JSON from the response
      const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        params = JSON.parse(jsonMatch[0]);
      } else {
        params = { endpoint: 'efficacy', indication: undefined };
      }
    } catch (error) {
      console.error('Error parsing endpoint information:', error);
      params = { endpoint: 'efficacy', indication: undefined };
    }
    
    return params;
  } catch (error) {
    console.error('Error extracting endpoint information:', error);
    return { endpoint: 'efficacy' };
  }
}

/**
 * Analyze a specific endpoint across trials
 * 
 * @param endpoint The endpoint to analyze
 * @param indication Optional indication to filter by
 * @returns Analysis of the endpoint
 */
async function analyzeEndpoint(endpoint: string, indication?: string): Promise<any[]> {
  try {
    // First, search for trials with relevant endpoints in their details
    let trialQuery = db.select({
      id: csr_reports.id,
      title: csr_reports.title,
      sponsor: csr_reports.sponsor,
      indication: csr_reports.indication,
      phase: csr_reports.phase,
      date: csr_reports.date,
      drugName: csr_reports.drug_name
    })
    .from(csr_reports)
    .innerJoin(csr_details, eq(csr_reports.id, csr_details.report_id))
    .where(eq(csr_reports.deleted_at, null));
    
    // Add endpoint search conditions
    trialQuery = trialQuery.where(
      or(
        ilike(csr_details.primary_objective, `%${endpoint}%`),
        ilike(csr_details.study_description, `%${endpoint}%`)
      )
    );
    
    // Add indication filter if provided
    if (indication) {
      trialQuery = trialQuery.where(ilike(csr_reports.indication, `%${indication}%`));
    }
    
    // Execute the query with limit
    const relevantTrials = await trialQuery.limit(10);
    
    // Structure the response
    return [
      {
        type: 'endpoint_analysis',
        endpoint: endpoint,
        indication: indication,
        relevantTrialCount: relevantTrials.length,
        trials: relevantTrials,
        endpointSummary: {
          usage: `Found in ${relevantTrials.length} trials`,
          phaseDistribution: summarizePhaseDistribution(relevantTrials),
          timeline: summarizeTimelineDistribution(relevantTrials)
        }
      }
    ];
  } catch (error) {
    console.error('Error analyzing endpoint:', error);
    return [];
  }
}

/**
 * Extract indication from a query
 * 
 * @param query The query about an indication
 * @returns The extracted indication
 */
async function extractIndicationFromQuery(query: string): Promise<string> {
  try {
    const extractionPrompt = `
    Extract the name of the disease, indication, or medical condition mentioned in this query.
    Return only the name of the condition without any explanations or additional text.
    
    Query: "${query}"
    `;
    
    const indication = await queryHuggingFace(extractionPrompt, HFModel.MISTRAL_7B, 100, 0.2);
    return indication.trim();
  } catch (error) {
    console.error('Error extracting indication from query:', error);
    return '';
  }
}

/**
 * Analyze trials for a specific indication
 * 
 * @param indication The indication to analyze
 * @returns Analysis of the indication
 */
async function analyzeIndication(indication: string): Promise<any[]> {
  try {
    // Find trials for this indication
    const trials = await db.select({
      id: csr_reports.id,
      title: csr_reports.title,
      sponsor: csr_reports.sponsor,
      phase: csr_reports.phase,
      status: csr_reports.status,
      date: csr_reports.date,
      drugName: csr_reports.drug_name
    })
    .from(csr_reports)
    .where(
      and(
        eq(csr_reports.deleted_at, null),
        ilike(csr_reports.indication, `%${indication}%`)
      )
    )
    .limit(20);
    
    // Get phase distribution
    const phaseDistribution = summarizePhaseDistribution(trials);
    
    // Get sponsor distribution
    const sponsorDistribution = summarizeSponsorDistribution(trials);
    
    // Get status distribution
    const statusDistribution = summarizeStatusDistribution(trials);
    
    // Get timeline
    const timeline = summarizeTimelineDistribution(trials);
    
    // Structure the response
    return [
      {
        type: 'indication_analysis',
        indication: indication,
        trialCount: trials.length,
        phaseDistribution,
        sponsorDistribution,
        statusDistribution,
        timeline,
        recentTrials: trials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      }
    ];
  } catch (error) {
    console.error('Error analyzing indication:', error);
    return [];
  }
}

/**
 * Extract sponsor name from a query
 * 
 * @param query The query about a sponsor
 * @returns The extracted sponsor name
 */
async function extractSponsorFromQuery(query: string): Promise<string> {
  try {
    const extractionPrompt = `
    Extract the name of the company, organization, or sponsor mentioned in this query.
    Return only the name without any explanations or additional text.
    
    Query: "${query}"
    `;
    
    const sponsor = await queryHuggingFace(extractionPrompt, HFModel.MISTRAL_7B, 100, 0.2);
    return sponsor.trim();
  } catch (error) {
    console.error('Error extracting sponsor from query:', error);
    return '';
  }
}

/**
 * Analyze trials for a specific sponsor
 * 
 * @param sponsor The sponsor to analyze
 * @returns Analysis of the sponsor's trials
 */
async function analyzeSponsor(sponsor: string): Promise<any[]> {
  try {
    // Find trials for this sponsor
    const trials = await db.select({
      id: csr_reports.id,
      title: csr_reports.title,
      indication: csr_reports.indication,
      phase: csr_reports.phase,
      status: csr_reports.status,
      date: csr_reports.date,
      drugName: csr_reports.drug_name
    })
    .from(csr_reports)
    .where(
      and(
        eq(csr_reports.deleted_at, null),
        ilike(csr_reports.sponsor, `%${sponsor}%`)
      )
    )
    .limit(30);
    
    // Get indication distribution
    const indicationDistribution = summarizeIndicationDistribution(trials);
    
    // Get phase distribution
    const phaseDistribution = summarizePhaseDistribution(trials);
    
    // Get status distribution
    const statusDistribution = summarizeStatusDistribution(trials);
    
    // Get timeline
    const timeline = summarizeTimelineDistribution(trials);
    
    // Structure the response
    return [
      {
        type: 'sponsor_analysis',
        sponsor: sponsor,
        trialCount: trials.length,
        indicationDistribution,
        phaseDistribution,
        statusDistribution,
        timeline,
        recentTrials: trials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      }
    ];
  } catch (error) {
    console.error('Error analyzing sponsor:', error);
    return [];
  }
}

/**
 * Find regulatory guidance relevant to a query
 * 
 * @param query The regulatory question
 * @returns Relevant guidance
 */
async function findRegulatoryGuidance(query: string): Promise<any[]> {
  try {
    // Use HuggingFace to generate appropriate regulatory guidance
    const guidancePrompt = `
    You are a pharmaceutical regulatory affairs expert. Answer the following question 
    about clinical trial regulatory requirements based on FDA, EMA, and Health Canada guidelines.
    
    Question: "${query}"
    
    Provide a clear, authoritative answer with references to specific regulatory documents when applicable.
    `;
    
    const guidance = await queryHuggingFace(guidancePrompt, HFModel.MISTRAL_7B, 1024, 0.4);
    
    // Structure the response
    return [
      {
        type: 'regulatory_guidance',
        query: query,
        guidance: guidance,
        sources: [
          {
            name: 'FDA Guidance for Industry',
            url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents'
          },
          {
            name: 'EMA Clinical Trials Regulation',
            url: 'https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials'
          },
          {
            name: 'Health Canada Clinical Trials Regulatory Framework',
            url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents/clinical-trials.html'
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error finding regulatory guidance:', error);
    return [];
  }
}

/**
 * Handle statistical questions about clinical trials
 * 
 * @param query The statistical question
 * @returns Statistical information
 */
async function handleStatisticalQuestion(query: string): Promise<any[]> {
  try {
    // Use HuggingFace to generate statistical information
    const statisticalPrompt = `
    You are a biostatistician specializing in clinical trials. Answer the following
    statistical question related to clinical trials.
    
    Question: "${query}"
    
    Provide a clear, accurate answer explaining the statistical concept, method, or approach.
    Include formulas if relevant, and explain when and how this is typically used in clinical trials.
    `;
    
    const statisticalInfo = await queryHuggingFace(statisticalPrompt, HFModel.MISTRAL_7B, 1024, 0.3);
    
    // Structure the response
    return [
      {
        type: 'statistical_information',
        query: query,
        information: statisticalInfo
      }
    ];
  } catch (error) {
    console.error('Error handling statistical question:', error);
    return [];
  }
}

/**
 * Provide protocol design advice
 * 
 * @param query The protocol question
 * @returns Protocol design advice
 */
async function provideProtocolAdvice(query: string): Promise<any[]> {
  try {
    // Extract key parameters from the query
    const extractionPrompt = `
    Extract protocol design parameters from this query.
    Return a JSON object with these fields (leave empty if not specified):
    {
      "indication": "disease or condition",
      "phase": "trial phase",
      "population": "target population",
      "intervention": "drug or treatment",
      "controls": "control group",
      "primaryEndpoint": "primary outcome measure",
      "secondaryEndpoints": ["list of secondary endpoints"],
      "designType": "type of trial design"
    }
    
    Query: "${query}"
    
    Return only valid JSON without any explanations.
    `;
    
    const extractionResponse = await queryHuggingFace(extractionPrompt, HFModel.STARLING, 1024, 0.3);
    
    // Parse the extraction results
    let params;
    try {
      // Find and extract JSON from the response
      const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        params = JSON.parse(jsonMatch[0]);
      } else {
        params = {};
      }
    } catch (error) {
      console.error('Error parsing protocol parameters:', error);
      params = {};
    }
    
    // Look for similar trials to use as reference
    let similarTrialsQuery = db.select({
      id: csr_reports.id,
      title: csr_reports.title,
      sponsor: csr_reports.sponsor,
      indication: csr_reports.indication,
      phase: csr_reports.phase,
      status: csr_reports.status,
      date: csr_reports.date,
      drugName: csr_reports.drug_name
    })
    .from(csr_reports)
    .innerJoin(csr_details, eq(csr_reports.id, csr_details.report_id))
    .where(eq(csr_reports.deleted_at, null));
    
    if (params.indication) {
      similarTrialsQuery = similarTrialsQuery.where(ilike(csr_reports.indication, `%${params.indication}%`));
    }
    
    if (params.phase) {
      similarTrialsQuery = similarTrialsQuery.where(ilike(csr_reports.phase, `%${params.phase}%`));
    }
    
    if (params.intervention) {
      similarTrialsQuery = similarTrialsQuery.where(ilike(csr_reports.drug_name, `%${params.intervention}%`));
    }
    
    const similarTrials = await similarTrialsQuery.limit(5);
    
    // Generate protocol advice based on the query and similar trials
    const advicePrompt = `
    You are a clinical trial protocol design expert. Provide advice for designing a protocol based on the following parameters:
    
    ${params.indication ? `Indication: ${params.indication}` : ''}
    ${params.phase ? `Phase: ${params.phase}` : ''}
    ${params.population ? `Population: ${params.population}` : ''}
    ${params.intervention ? `Intervention: ${params.intervention}` : ''}
    ${params.controls ? `Controls: ${params.controls}` : ''}
    ${params.primaryEndpoint ? `Primary Endpoint: ${params.primaryEndpoint}` : ''}
    ${params.designType ? `Design Type: ${params.designType}` : ''}
    
    Similar trials for reference:
    ${similarTrials.map(t => `- ${t.title} (${t.phase}, ${t.sponsor})`).join('\n')}
    
    Provide comprehensive advice covering:
    1. Study Design and Structure
    2. Endpoint Selection
    3. Inclusion/Exclusion Criteria
    4. Statistical Considerations
    5. Regulatory Considerations
    `;
    
    const advice = await queryHuggingFace(advicePrompt, HFModel.MISTRAL_7B, 2048, 0.3);
    
    // Structure the response
    return [
      {
        type: 'protocol_advice',
        parameters: params,
        advice: advice,
        similarTrials: similarTrials
      }
    ];
  } catch (error) {
    console.error('Error providing protocol advice:', error);
    return [];
  }
}

/**
 * Handle general questions about clinical trials
 * 
 * @param query The general question
 * @returns General information
 */
async function handleGeneralQuestion(query: string): Promise<any[]> {
  try {
    // Use HuggingFace to generate a response to the general question
    const promptContext = `You are a clinical research expert assistant for TrialSage, a platform that analyzes clinical study reports.
    Answer the following question from a clinical researcher:
    
    Question: "${query}"
    
    Provide a helpful, accurate, and comprehensive answer. If the question is ambiguous or requires clarification,
    explain what additional information would be helpful to provide a better answer.`;
    
    const response = await queryHuggingFace(promptContext, HFModel.MISTRAL_7B, 1024, 0.5);
    
    // Structure the response
    return [
      {
        type: 'general_information',
        query: query,
        information: response
      }
    ];
  } catch (error) {
    console.error('Error handling general question:', error);
    return [];
  }
}

/**
 * Generate an AI analysis of the query results
 * 
 * @param query The original query
 * @param results The query results
 * @param queryType The type of query
 * @returns AI-generated analysis
 */
async function generateAnalysis(query: string, results: any[], queryType: QueryType): Promise<string> {
  try {
    // Create a simplified version of the results for the prompt
    const simplifiedResults = JSON.stringify(results, (key, value) => {
      // Limit the size of string values
      if (typeof value === 'string' && value.length > 500) {
        return value.substring(0, 500) + '...';
      }
      return value;
    }).substring(0, 2000); // Limit the total size
    
    // Generate analysis based on query type and results
    const analysisPrompt = `
    You are a clinical research expert analyzing results of a database query.
    
    Original query: "${query}"
    
    Query type: ${queryType}
    
    Results: ${simplifiedResults}
    
    Provide a concise but insightful analysis of these results. Highlight key patterns, 
    interesting findings, or connections that might be valuable to the researcher.
    Limit your analysis to 3-5 sentences.
    `;
    
    const analysis = await queryHuggingFace(analysisPrompt, HFModel.MISTRAL_7B, 800, 0.4);
    return analysis.trim();
  } catch (error) {
    console.error('Error generating analysis:', error);
    return 'Unable to generate analysis due to an error.';
  }
}

/**
 * Generate suggested follow-up queries
 * 
 * @param query The original query
 * @param results The query results
 * @param queryType The type of query
 * @returns List of suggested follow-up questions
 */
async function generateSuggestedQueries(query: string, results: any[], queryType: QueryType): Promise<string[]> {
  try {
    // Create a simplified version of the results for the prompt
    const simplifiedResults = JSON.stringify(results, (key, value) => {
      // Limit the size of string values
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '...';
      }
      return value;
    }).substring(0, 1000); // Limit the total size
    
    // Generate suggestions based on query type and results
    const suggestionsPrompt = `
    Based on the following query and results, suggest 3 follow-up questions that would help the researcher
    explore this topic further.
    
    Original query: "${query}"
    
    Query type: ${queryType}
    
    Results summary: ${simplifiedResults}
    
    Provide exactly 3 concise follow-up questions as a JSON array of strings.
    Example: ["What is the average success rate for Phase 3 trials in oncology?", "How do the eligibility criteria differ between these trials?", "Which sponsors have the most trials in this therapeutic area?"]
    `;
    
    const suggestionsResponse = await queryHuggingFace(suggestionsPrompt, HFModel.STARLING, 1024, 0.7);
    
    // Parse the suggestions
    let suggestions: string[] = [];
    try {
      // Find and extract JSON array from the response
      const jsonMatch = suggestionsResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing suggested queries:', error);
      suggestions = [];
    }
    
    // If we failed to get suggestions, provide some defaults
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      switch (queryType) {
        case QueryType.FIND_TRIALS:
          suggestions = [
            "What are the most recent trials for this indication?",
            "Which sponsors have the most trials in this area?",
            "How do the endpoints compare across these trials?"
          ];
          break;
          
        case QueryType.COMPARE_TRIALS:
          suggestions = [
            "What are the key design differences between these trials?",
            "How do the inclusion criteria differ between these studies?",
            "What other trials are similar to these?"
          ];
          break;
          
        default:
          suggestions = [
            "Show me more recent trials in this therapeutic area",
            "What are the common endpoints for these types of trials?",
            "Which sponsors are most active in this field?"
          ];
      }
    }
    
    return suggestions.slice(0, 3); // Ensure we return at most 3 suggestions
  } catch (error) {
    console.error('Error generating suggested queries:', error);
    return [
      "Show me more recent trials in this therapeutic area",
      "What are the common endpoints for these types of trials?",
      "Which sponsors are most active in this field?"
    ];
  }
}

/**
 * Save a user's query for future reference
 * 
 * @param userId The user's ID
 * @param query The query text
 * @param queryType The type of query
 * @param resultCount Number of results returned
 */
async function saveUserQuery(userId: number, query: string, queryType: QueryType, resultCount: number): Promise<void> {
  try {
    // Create query history table if we decide to implement this
    // This would track user queries for personalization and analytics
    console.log(`Saving query for user ${userId}: ${query} (${queryType}) - ${resultCount} results`);
  } catch (error) {
    console.error('Error saving user query:', error);
  }
}

// Helper functions to summarize distributions

function summarizePhaseDistribution(trials: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const trial of trials) {
    const phase = trial.phase || 'Unknown';
    distribution[phase] = (distribution[phase] || 0) + 1;
  }
  
  return distribution;
}

function summarizeSponsorDistribution(trials: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const trial of trials) {
    const sponsor = trial.sponsor || 'Unknown';
    distribution[sponsor] = (distribution[sponsor] || 0) + 1;
  }
  
  return distribution;
}

function summarizeIndicationDistribution(trials: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const trial of trials) {
    const indication = trial.indication || 'Unknown';
    distribution[indication] = (distribution[indication] || 0) + 1;
  }
  
  return distribution;
}

function summarizeStatusDistribution(trials: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const trial of trials) {
    const status = trial.status || 'Unknown';
    distribution[status] = (distribution[status] || 0) + 1;
  }
  
  return distribution;
}

function summarizeTimelineDistribution(trials: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const trial of trials) {
    if (!trial.date) continue;
    
    const year = new Date(trial.date).getFullYear().toString();
    distribution[year] = (distribution[year] || 0) + 1;
  }
  
  return distribution;
}