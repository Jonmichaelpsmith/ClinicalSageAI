import { storage } from '../storage';
import { huggingFaceService, HFModel } from '../huggingface-service';
import { semanticSearchService } from './semantic-search-service';

interface ClinicalInsight {
  text: string;
  source: string;
  confidence: number;
}

interface EndpointRecommendation {
  endpoint: string;
  rationale: string;
  supportingEvidence: string;
  confidence: number;
}

interface SampleSizeRecommendation {
  recommendation: number;
  rationale: string;
  confidenceInterval: [number, number];
  powerAnalysis: string;
}

interface StudyDesignRecommendation {
  designType: string;
  rationale: string;
  limitations: string[];
  alternatives: string[];
}

interface ClinicalIntelligenceResponse {
  query: string;
  insights: ClinicalInsight[];
  endpointRecommendations?: EndpointRecommendation[];
  sampleSizeRecommendation?: SampleSizeRecommendation;
  studyDesignRecommendation?: StudyDesignRecommendation;
  relevantReports: {
    id: number;
    title: string;
    relevance: number;
  }[];
  competitiveIntelligence?: string;
  regulatoryConsiderations?: string;
}

/**
 * Service that provides clinical trial intelligence based on CSR analysis
 */
export class ClinicalIntelligenceService {
  private isInitialized: boolean = false;
  private indexingInProgress: boolean = false;
  private totalIndexedDocuments: number = 0;
  
  /**
   * Initialize the semantic search index with CSR data
   */
  async initializeSearchIndex(): Promise<void> {
    if (this.isInitialized || this.indexingInProgress) {
      return;
    }
    
    this.indexingInProgress = true;
    console.log('Initializing clinical intelligence semantic search index...');
    
    try {
      // Get all CSR reports from the database
      const reports = await storage.getAllCsrReports();
      console.log(`Found ${reports.length} reports to index`);
      
      // Process each report
      let indexedCount = 0;
      for (const report of reports) {
        try {
          // Skip reports without a summary
          if (!report.summary || report.summary.trim().length < 50) {
            continue;
          }
          
          // Create a more comprehensive document by fetching details
          let documentText = `Title: ${report.title}\n`;
          documentText += `Sponsor: ${report.sponsor}\n`;
          documentText += `Indication: ${report.indication}\n`;
          documentText += `Phase: ${report.phase}\n`;
          documentText += `Summary: ${report.summary}\n\n`;
          
          // Try to get more detailed information
          const details = await storage.getCsrDetails(report.id);
          if (details) {
            if (details.studyDesign) documentText += `Study Design: ${details.studyDesign}\n`;
            if (details.primaryObjective) documentText += `Primary Objective: ${details.primaryObjective}\n`;
            if (details.sampleSize) documentText += `Sample Size: ${details.sampleSize}\n`;
            // Add other fields as needed
          }
          
          // Add to semantic search index
          await semanticSearchService.addDocument(report.id, documentText, {
            id: report.id,
            title: report.title,
            sponsor: report.sponsor,
            indication: report.indication,
            phase: report.phase
          });
          
          indexedCount++;
          
          // Log progress every 10 documents
          if (indexedCount % 10 === 0) {
            console.log(`Indexed ${indexedCount}/${reports.length} documents`);
          }
        } catch (error) {
          console.error(`Error indexing report ${report.id}:`, error);
          // Continue with next report
        }
      }
      
      this.totalIndexedDocuments = indexedCount;
      this.isInitialized = true;
      console.log(`Completed indexing ${indexedCount} documents for clinical intelligence`);
    } catch (error) {
      console.error('Error initializing clinical intelligence index:', error);
    } finally {
      this.indexingInProgress = false;
    }
  }
  
  /**
   * Get clinical insights based on a query
   */
  async getInsights(
    query: string,
    indication: string = '',
    phase: string = ''
  ): Promise<ClinicalIntelligenceResponse> {
    // Ensure the index is initialized
    if (!this.isInitialized && !this.indexingInProgress) {
      await this.initializeSearchIndex();
    }
    
    // Create a more comprehensive query if indication/phase provided
    let enhancedQuery = query;
    if (indication) enhancedQuery += ` for ${indication}`;
    if (phase) enhancedQuery += ` in Phase ${phase} trials`;
    
    // Retrieve relevant reports through semantic search
    const searchResults = await semanticSearchService.search(enhancedQuery, 10);
    
    // Extract relevant context for the AI
    const relevantText = await semanticSearchService.retrieveRelevantContext(enhancedQuery, 6000);
    
    // Create a context prompt for the AI
    const prompt = `
You are a Clinical Trial Intelligence Specialist with decades of experience in clinical trial design and execution.
Analyze the following clinical trial reports and provide insights for the query.

QUERY: ${query}
${indication ? `Indication: ${indication}` : ''}
${phase ? `Phase: ${phase}` : ''}

RELEVANT CLINICAL TRIAL REPORTS:
${relevantText}

Based on the above clinical trial reports and your expertise, please provide:
1. Key insights relevant to the query
2. Evidence-based recommendations
3. Limitations and potential challenges
4. Alternative approaches if applicable

Provide your analysis in a structured, concise, and professional manner.
`;

    // Get AI-generated insights using HuggingFace
    const aiResponse = await huggingFaceService.queryHuggingFace(
      prompt,
      HFModel.MISTRAL_LATEST,
      1500,
      0.4
    );
    
    // Extract insights from the AI response
    const insights: ClinicalInsight[] = [
      {
        text: aiResponse,
        source: 'AI Analysis of Clinical Study Reports',
        confidence: 0.85
      }
    ];
    
    // Prepare the response
    const response: ClinicalIntelligenceResponse = {
      query,
      insights,
      relevantReports: searchResults.map(result => ({
        id: result.document.id,
        title: result.document.metadata?.title || `Report #${result.document.id}`,
        relevance: result.score
      }))
    };
    
    // Generate endpoint recommendations if query is about endpoints
    if (query.toLowerCase().includes('endpoint') || query.toLowerCase().includes('outcome measure')) {
      response.endpointRecommendations = await this.generateEndpointRecommendations(query, indication, phase);
    }
    
    // Generate sample size recommendation if query is about sample size
    if (query.toLowerCase().includes('sample size') || query.toLowerCase().includes('participants') || query.toLowerCase().includes('subjects')) {
      response.sampleSizeRecommendation = await this.generateSampleSizeRecommendation(query, indication, phase);
    }
    
    // Generate study design recommendation if query is about study design
    if (query.toLowerCase().includes('study design') || query.toLowerCase().includes('trial design')) {
      response.studyDesignRecommendation = await this.generateStudyDesignRecommendation(query, indication, phase);
    }
    
    return response;
  }
  
  /**
   * Generate endpoint recommendations
   */
  private async generateEndpointRecommendations(
    query: string,
    indication: string,
    phase: string
  ): Promise<EndpointRecommendation[]> {
    // Get relevant reports
    const reports = await storage.getAllCsrReports();
    const filteredReports = reports.filter(report => {
      let match = true;
      if (indication) match = match && report.indication.toLowerCase().includes(indication.toLowerCase());
      if (phase) match = match && report.phase === phase;
      return match;
    });
    
    // Get the top 5 reports
    const topReports = filteredReports.slice(0, 5);
    
    // Prepare detailed endpoint information
    let endpointContext = '';
    for (const report of topReports) {
      try {
        const details = await storage.getCsrDetails(report.id);
        if (details && details.primaryObjective) {
          endpointContext += `Report: ${report.title}\n`;
          endpointContext += `Indication: ${report.indication}\n`;
          endpointContext += `Phase: ${report.phase}\n`;
          endpointContext += `Primary Objective: ${details.primaryObjective}\n\n`;
        }
      } catch (error) {
        console.error(`Error getting details for report ${report.id}:`, error);
      }
    }
    
    // Get AI recommendations
    const prompt = `
Based on the following clinical trial information, recommend 3 appropriate primary endpoints for a ${phase || ''} trial in ${indication || 'the given indication'}.

CLINICAL TRIAL INFORMATION:
${endpointContext}

For each endpoint, provide:
1. The endpoint definition
2. Rationale for selecting this endpoint
3. Supporting evidence from similar trials
4. Confidence level (high, medium, or low)

Format your response as a structured list of 3 endpoint recommendations.
`;

    const aiResponse = await huggingFaceService.queryHuggingFace(
      prompt,
      HFModel.MISTRAL_LATEST,
      1200,
      0.3
    );
    
    // Parse the AI response into structured recommendations
    // This is a simplified parsing, could be made more robust
    const sections = aiResponse.split(/\d+\./g).slice(1);
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      // Extract information with simple heuristics
      const endpoint = lines[0]?.trim() || `Endpoint ${index + 1}`;
      const rationale = lines.find(line => line.includes('Rationale')) || '';
      const evidence = lines.find(line => line.includes('Evidence') || line.includes('Supporting')) || '';
      const confidenceText = lines.find(line => line.includes('Confidence')) || 'medium';
      
      // Map confidence text to number
      let confidence = 0.7;
      if (confidenceText.toLowerCase().includes('high')) confidence = 0.9;
      if (confidenceText.toLowerCase().includes('low')) confidence = 0.5;
      
      return {
        endpoint,
        rationale,
        supportingEvidence: evidence,
        confidence
      };
    });
  }
  
  /**
   * Generate sample size recommendation
   */
  private async generateSampleSizeRecommendation(
    query: string,
    indication: string,
    phase: string
  ): Promise<SampleSizeRecommendation> {
    // Fetch average sample sizes for similar trials
    const reports = await storage.getAllCsrReports();
    const filteredReports = reports.filter(report => {
      let match = true;
      if (indication) match = match && report.indication.toLowerCase().includes(indication.toLowerCase());
      if (phase) match = match && report.phase === phase;
      return match;
    });
    
    // Get report details with sample sizes
    const detailedReports = [];
    for (const report of filteredReports.slice(0, 10)) {
      try {
        const details = await storage.getCsrDetails(report.id);
        if (details && details.sampleSize) {
          detailedReports.push({
            ...report,
            sampleSize: details.sampleSize
          });
        }
      } catch (error) {
        console.error(`Error getting details for report ${report.id}:`, error);
      }
    }
    
    // Calculate average sample size if available
    let averageSampleSize = 0;
    if (detailedReports.length > 0) {
      const sampleSizes = detailedReports
        .map(r => typeof r.sampleSize === 'number' ? r.sampleSize : parseInt(r.sampleSize as string))
        .filter(size => !isNaN(size));
      
      if (sampleSizes.length > 0) {
        averageSampleSize = sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length;
      }
    }
    
    // Create context for AI
    let sampleSizeContext = `Average sample size for ${indication || 'similar'} trials in Phase ${phase || 'various'}: ${Math.round(averageSampleSize) || 'Unknown'}\n\n`;
    
    detailedReports.forEach((report, index) => {
      sampleSizeContext += `Trial ${index + 1}: ${report.title}\n`;
      sampleSizeContext += `Indication: ${report.indication}\n`;
      sampleSizeContext += `Phase: ${report.phase}\n`;
      sampleSizeContext += `Sample Size: ${report.sampleSize}\n\n`;
    });
    
    // Get AI recommendation
    const prompt = `
As a clinical trial statistician, recommend an appropriate sample size for a ${phase || ''} clinical trial in ${indication || 'the given indication'}.

SIMILAR TRIAL INFORMATION:
${sampleSizeContext}

Based on the above information and statistical best practices, provide:
1. A specific sample size recommendation (as a number)
2. Rationale for this recommendation
3. A confidence interval for the sample size
4. A brief power analysis explanation

Format your response in a structured way that can be easily parsed.
`;

    const aiResponse = await huggingFaceService.queryHuggingFace(
      prompt,
      HFModel.MISTRAL_LATEST,
      800,
      0.3
    );
    
    // Parse the response to extract the recommendation
    const recommendationMatch = aiResponse.match(/recommendation:?\s*(\d+)/i);
    const recommendation = recommendationMatch ? parseInt(recommendationMatch[1]) : Math.round(averageSampleSize);
    
    // Extract confidence interval with regex
    const ciMatch = aiResponse.match(/confidence interval:?\s*\[?(\d+)[^\d]+(\d+)\]?/i);
    const confidenceInterval: [number, number] = ciMatch 
      ? [parseInt(ciMatch[1]), parseInt(ciMatch[2])]
      : [Math.round(recommendation * 0.8), Math.round(recommendation * 1.2)];
    
    return {
      recommendation,
      rationale: aiResponse,
      confidenceInterval,
      powerAnalysis: aiResponse.includes('power analysis') 
        ? aiResponse.split('power analysis')[1] || 'Based on typical effect sizes in similar trials'
        : 'Based on typical effect sizes in similar trials'
    };
  }
  
  /**
   * Generate study design recommendation
   */
  private async generateStudyDesignRecommendation(
    query: string,
    indication: string,
    phase: string
  ): Promise<StudyDesignRecommendation> {
    // Retrieve top study designs from reports
    const reports = await storage.getAllCsrReports();
    const filteredReports = reports.filter(report => {
      let match = true;
      if (indication) match = match && report.indication.toLowerCase().includes(indication.toLowerCase());
      if (phase) match = match && report.phase === phase;
      return match;
    });
    
    // Get study design details
    let designContext = '';
    for (const report of filteredReports.slice(0, 5)) {
      try {
        const details = await storage.getCsrDetails(report.id);
        if (details && details.studyDesign) {
          designContext += `Report: ${report.title}\n`;
          designContext += `Indication: ${report.indication}\n`;
          designContext += `Phase: ${report.phase}\n`;
          designContext += `Study Design: ${details.studyDesign}\n\n`;
        }
      } catch (error) {
        console.error(`Error getting details for report ${report.id}:`, error);
      }
    }
    
    // Get AI recommendation
    const prompt = `
As a clinical trial design expert, recommend an optimal study design for a ${phase || ''} clinical trial in ${indication || 'the given indication'}.

SIMILAR TRIAL DESIGNS:
${designContext}

Based on the above information and clinical trial best practices, provide:
1. A specific study design recommendation
2. Rationale for selecting this design
3. Limitations of this design (at least 2)
4. Alternative designs to consider (at least 2)

Format your response in a structured way that can be easily parsed.
`;

    const aiResponse = await huggingFaceService.queryHuggingFace(
      prompt,
      HFModel.MISTRAL_LATEST,
      1000,
      0.3
    );
    
    // Parse the limitations using regex
    const limitationsMatch = aiResponse.match(/limitations?:([^\n]*(?:\n[^\n]*)*?)(?:\n\n|\n[a-z]+:)/i);
    const limitationsText = limitationsMatch ? limitationsMatch[1] : '';
    const limitations = limitationsText
      .split(/\n-|\n\d+\./)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    
    // Parse the alternatives using regex
    const alternativesMatch = aiResponse.match(/alternatives?:([^\n]*(?:\n[^\n]*)*?)(?:\n\n|$)/i);
    const alternativesText = alternativesMatch ? alternativesMatch[1] : '';
    const alternatives = alternativesText
      .split(/\n-|\n\d+\./)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    
    return {
      designType: aiResponse.split('\n')[0] || 'Randomized, controlled trial',
      rationale: aiResponse,
      limitations: limitations.length > 0 ? limitations : ['Sample size limitations', 'Potential for selection bias'],
      alternatives: alternatives.length > 0 ? alternatives : ['Single-arm open-label design', 'Adaptive design']
    };
  }
  
  /**
   * Get statistics about indexed clinical data
   */
  getIndexStats() {
    return {
      isInitialized: this.isInitialized,
      indexingInProgress: this.indexingInProgress,
      totalIndexedDocuments: this.totalIndexedDocuments,
      searchAvailable: this.isInitialized && this.totalIndexedDocuments > 0
    };
  }
}

// Export a singleton instance for convenience
export const clinicalIntelligenceService = new ClinicalIntelligenceService();