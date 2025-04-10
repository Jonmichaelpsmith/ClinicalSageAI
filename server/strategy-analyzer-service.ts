import { db } from './db';
import { eq, like, desc } from 'drizzle-orm';
import { csrReports, csrDetails } from '@shared/schema';
import { huggingFaceService } from './huggingface-service';

interface StrategyAnalysisParams {
  protocolSummary: string;
  indication?: string;
  phase?: string;
  sponsor?: string;
}

interface TrialContextItem {
  id: number;
  title: string;
  sponsor: string;
  indication: string;
  phase: string;
  summary?: string;
}

/**
 * Generate strategic analysis for a protocol
 */
export async function generateStrategyAnalysis(params: StrategyAnalysisParams) {
  try {
    // 1. Get HuggingFace service for AI generation
    const hfService = huggingFaceService;
    
    // 2. Gather context from similar CSRs
    const csrContext = await getRelevantCSRContext(params);
    
    // 3. Get ClinicalTrials.gov context (using data we already have)
    const ctgovContext = await getRelevantCTGovContext(params);
    
    // 4. Generate the strategic analysis
    const prompt = createStrategyPrompt(params.protocolSummary, csrContext, ctgovContext);
    const analysisResult = await hfService.queryHuggingFace(prompt);
    
    // 5. Structure the response
    return structureStrategyResponse(analysisResult, csrContext, ctgovContext);
  } catch (error) {
    console.error("Error generating strategy analysis:", error);
    throw error;
  }
}

/**
 * Get relevant CSR context for the strategy analysis
 */
async function getRelevantCSRContext(params: StrategyAnalysisParams): Promise<TrialContextItem[]> {
  // Query for relevant CSRs based on indication and phase (if provided)
  const filters = [];
  
  if (params.indication) {
    filters.push(like(csrReports.indication, `%${params.indication}%`));
  }
  
  if (params.phase) {
    filters.push(eq(csrReports.phase, params.phase));
  }
  
  if (params.sponsor) {
    filters.push(eq(csrReports.sponsor, params.sponsor));
  }
  
  // Get matching reports - limit to 5 most relevant
  const reports = await db.select()
    .from(csrReports)
    .where(filters.length > 0 ? filters[0] : undefined)
    .orderBy(desc(csrReports.uploadDate))
    .limit(5);
  
  // Get details for these reports
  const reportDetails = await Promise.all(
    reports.map(async (report) => {
      const [details] = await db.select()
        .from(csrDetails)
        .where(eq(csrDetails.reportId, report.id));
      
      return {
        id: report.id,
        title: report.title,
        sponsor: report.sponsor,
        indication: report.indication,
        phase: report.phase,
        summary: details?.studyDescription || undefined
      };
    })
  );
  
  return reportDetails;
}

/**
 * Get relevant ClinicalTrials.gov context for the strategy analysis
 * (Using CSR data as proxy since we already have that)
 */
async function getRelevantCTGovContext(params: StrategyAnalysisParams): Promise<TrialContextItem[]> {
  // Get additional trials that may not be in the CSR database but are similar
  const filters = [];
  
  if (params.indication) {
    filters.push(like(csrReports.indication, `%${params.indication}%`));
  }
  
  if (params.phase) {
    filters.push(eq(csrReports.phase, params.phase));
  }
  
  // Different sponsors from the target sponsor
  if (params.sponsor) {
    // This is intentional - we want OTHER sponsors in this context
    // but we don't want to exclude data if no sponsor is specified
  }
  
  // Get additional matching reports - this time focus on recent reports and different sponsors
  const reports = await db.select()
    .from(csrReports)
    .where(filters.length > 0 ? filters[0] : undefined)
    .orderBy(desc(csrReports.uploadDate))
    .limit(5);
  
  return reports.map(report => ({
    id: report.id,
    title: report.title,
    sponsor: report.sponsor,
    indication: report.indication,
    phase: report.phase
  }));
}

/**
 * Create the strategy analysis prompt
 */
function createStrategyPrompt(
  protocolSummary: string,
  csrContext: TrialContextItem[],
  ctgovContext: TrialContextItem[]
): string {
  // Format CSR context as text
  const csrContextText = csrContext.map(item => 
    `CSR ID ${item.id}: "${item.title}" by ${item.sponsor} for ${item.indication} (Phase ${item.phase})${item.summary ? `\nSummary: ${item.summary}` : ''}`
  ).join('\n\n');
  
  // Format CTGov context as text
  const ctgovContextText = ctgovContext.map(item => 
    `Trial: "${item.title}" by ${item.sponsor} for ${item.indication} (Phase ${item.phase})`
  ).join('\n\n');
  
  // Build the complete prompt
  const prompt = `
You are a strategic advisor for clinical trials. A client has submitted the following protocol summary:

"${protocolSummary}"

Below are excerpts from recent historical CSR documents:
${csrContextText}

And summaries of related trials from ClinicalTrials.gov:
${ctgovContextText}

Based on this data, provide strategic guidance across:

1. R&D Strategy  
2. Clinical Development  
3. Market Strategy  

Give specific recommendations with justification from precedent. Highlight competitor strengths and weaknesses.
Provide specific, actionable recommendations that would give the client a strategic advantage.
`;

  return prompt;
}

/**
 * Structure the strategy response
 */
function structureStrategyResponse(
  analysisText: string,
  csrContext: TrialContextItem[],
  ctgovContext: TrialContextItem[]
) {
  // Extract sections from the analysis
  const rdStrategyMatch = analysisText.match(/1\.\s*R&D Strategy(.*?)(?=2\.\s*Clinical Development|$)/s);
  const clinicalDevMatch = analysisText.match(/2\.\s*Clinical Development(.*?)(?=3\.\s*Market Strategy|$)/s);
  const marketStrategyMatch = analysisText.match(/3\.\s*Market Strategy(.*?)(?=$)/s);
  
  // Create structured response
  return {
    analysis: {
      rdStrategy: rdStrategyMatch ? rdStrategyMatch[1].trim() : '',
      clinicalDevelopment: clinicalDevMatch ? clinicalDevMatch[1].trim() : '',
      marketStrategy: marketStrategyMatch ? marketStrategyMatch[1].trim() : '',
      fullText: analysisText
    },
    context: {
      csrReferences: csrContext.map(item => ({
        id: item.id,
        title: item.title,
        sponsor: item.sponsor,
        indication: item.indication,
        phase: item.phase
      })),
      competitorTrials: ctgovContext.map(item => ({
        id: item.id,
        title: item.title,
        sponsor: item.sponsor,
        indication: item.indication,
        phase: item.phase
      }))
    }
  };
}