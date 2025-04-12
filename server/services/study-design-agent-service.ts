import { storage } from '../storage';
import { huggingFaceService, HFModel } from '../huggingface-service';
import { memoryService, type ChatMessage } from './memory-service';
import { clinicalIntelligenceService } from './clinical-intelligence-service';
import { academicKnowledgeService } from './academic-knowledge-service';
import { semanticSearchService } from './semantic-search-service';

interface StudyDesignQuery {
  query: string;
  indication?: string;
  phase?: string;
}

interface AgentResponse {
  content: string;
  sources: {
    id: number;
    title: string;
    relevance: number;
  }[];
  confidence: number;
  metadata?: Record<string, any>;
}

/**
 * Sophisticated AI agent service for clinical trial study design
 */
export class StudyDesignAgentService {
  private initialized: boolean = false;
  private contentIndex: boolean = false;
  
  constructor() {}
  
  /**
   * Initialize services required by the agent
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      console.log('Initializing Study Design Agent service...');
      
      // Initialize clinical intelligence service (if not already initialized)
      await clinicalIntelligenceService.initializeSearchIndex();
      
      // Initialize academic knowledge service
      await academicKnowledgeService.initialize();
      
      this.initialized = true;
      console.log('Study Design Agent service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Study Design Agent service:', error);
      return false;
    }
  }
  
  /**
   * Generate a response to a study design query
   */
  async generateResponse(
    queryData: StudyDesignQuery,
    conversationId: string
  ): Promise<AgentResponse> {
    // Ensure services are initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Create the conversation if it doesn't exist
      let conversation = memoryService.getConversation(conversationId);
      if (!conversation) {
        conversationId = memoryService.createConversation(
          conversationId,
          `You are TrialSage's Study Design Agent, a specialized clinical trial advisor with deep expertise in protocol design and optimization.`,
          {
            indication: queryData.indication,
            phase: queryData.phase
          }
        );
        conversation = memoryService.getConversation(conversationId);
      }
      
      // Add user message to conversation memory
      const userMessage: ChatMessage = {
        role: 'user',
        content: queryData.query,
        timestamp: new Date()
      };
      memoryService.addMessage(conversationId, userMessage);
      
      // Get clinical intelligence insights
      console.log('Getting clinical intelligence insights...');
      const clinicalInsights = await clinicalIntelligenceService.getInsights(
        queryData.query,
        queryData.indication,
        queryData.phase
      );
      
      // Get academic knowledge insights
      console.log('Getting academic knowledge insights...');
      const academicInsights = await academicKnowledgeService.generateInsights(queryData.query);
      
      // Get relevant reports through more basic search
      console.log('Getting relevant CSR reports...');
      const reports = await storage.getAllCsrReports();
      
      // Basic filtering by indication and phase
      const filteredReports = reports.filter(report => {
        let match = true;
        if (queryData.indication) match = match && report.indication.toLowerCase().includes(queryData.indication.toLowerCase());
        if (queryData.phase) match = match && report.phase === queryData.phase;
        return match;
      });
      
      // Add relevant report data
      const reportNames = filteredReports.slice(0, 5).map(r => r.title).join(', ');
      console.log(`Found relevant CSR reports: ${reportNames}`);
      
      // Get conversation history
      const chatHistory = memoryService.formatChatHistory(conversationId, 6);
      
      // Prepare the context with all available intelligence
      let context = '';
      
      // Add chat history
      context += `CONVERSATION HISTORY:\n${chatHistory}\n\n`;
      
      // Add clinical intelligence
      context += 'CLINICAL TRIAL INTELLIGENCE:\n';
      if (clinicalInsights.insights && clinicalInsights.insights.length > 0) {
        context += clinicalInsights.insights[0].text.substring(0, 1500);
      }
      context += '\n\n';
      
      // Add academic insights
      context += 'ACADEMIC KNOWLEDGE INSIGHTS:\n';
      context += academicInsights.substring(0, 1000);
      context += '\n\n';
      
      // Add clinical report references
      context += 'RELEVANT CLINICAL STUDY REPORTS:\n';
      for (const report of filteredReports.slice(0, 3)) {
        context += `- ${report.title} (Phase ${report.phase}, ${report.sponsor})\n`;
        context += `  Indication: ${report.indication}\n`;
        if (report.summary) {
          context += `  Summary: ${report.summary.substring(0, 200)}...\n`;
        }
        context += '\n';
      }
      
      // Add information about special case handling
      if (queryData.query.toLowerCase().includes('endpoint')) {
        context += '\nENDPOINT INTELLIGENCE:\n';
        if (clinicalInsights.endpointRecommendations) {
          clinicalInsights.endpointRecommendations.forEach((rec, i) => {
            context += `Endpoint ${i+1}: ${rec.endpoint}\n`;
            context += `Rationale: ${rec.rationale}\n`;
          });
        }
        context += '\n';
      }
      
      if (queryData.query.toLowerCase().includes('sample size')) {
        context += '\nSAMPLE SIZE INTELLIGENCE:\n';
        if (clinicalInsights.sampleSizeRecommendation) {
          context += `Recommended sample size: ${clinicalInsights.sampleSizeRecommendation.recommendation}\n`;
          context += `Confidence interval: ${clinicalInsights.sampleSizeRecommendation.confidenceInterval[0]}-${clinicalInsights.sampleSizeRecommendation.confidenceInterval[1]}\n`;
          context += `Rationale: ${clinicalInsights.sampleSizeRecommendation.rationale.substring(0, 200)}...\n`;
        }
        context += '\n';
      }
      
      if (queryData.query.toLowerCase().includes('design')) {
        context += '\nSTUDY DESIGN INTELLIGENCE:\n';
        if (clinicalInsights.studyDesignRecommendation) {
          context += `Recommended design: ${clinicalInsights.studyDesignRecommendation.designType}\n`;
          context += `Rationale: ${clinicalInsights.studyDesignRecommendation.rationale.substring(0, 200)}...\n`;
        }
        context += '\n';
      }
      
      // Create the agent prompt
      const prompt = `
<context>
${context}
</context>

<current_query>
${queryData.query}
</current_query>

As TrialSage's Study Design Agent, provide a comprehensive, evidence-based response to the query above.
Your response should:
1. Directly answer the user's question with specific, actionable information
2. Reference relevant clinical trials and academic resources when appropriate
3. Provide concrete recommendations with clear rationales
4. Note any limitations or areas of uncertainty
5. Be concise but thorough, using clinical terminology appropriately

Structure your response in a clear, professional manner with appropriate sections.
`;

      // Generate the AI response
      console.log('Generating AI response...');
      const aiResponse = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        1000,
        0.4
      );
      
      // Create the final response
      const response: AgentResponse = {
        content: aiResponse,
        sources: clinicalInsights.relevantReports,
        confidence: 0.85, // This could be calculated based on data quality
        metadata: {
          indication: queryData.indication,
          phase: queryData.phase,
          query_type: this.categorizeQuery(queryData.query)
        }
      };
      
      // Add assistant message to conversation memory
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      memoryService.addMessage(conversationId, assistantMessage);
      
      return response;
    } catch (error) {
      console.error('Error generating study design agent response:', error);
      
      // Return an error response
      return {
        content: `I apologize, but I encountered an error while processing your query: "${queryData.query}". Please try again with a more specific question about clinical trial design.`,
        sources: [],
        confidence: 0.1
      };
    }
  }
  
  /**
   * Categorize the query type
   */
  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('endpoint') || lowerQuery.includes('outcome measure')) {
      return 'endpoint_selection';
    } else if (lowerQuery.includes('sample size') || lowerQuery.includes('participants')) {
      return 'sample_size';
    } else if (lowerQuery.includes('design') || lowerQuery.includes('methodology')) {
      return 'study_design';
    } else if (lowerQuery.includes('inclusion') || lowerQuery.includes('exclusion') || lowerQuery.includes('criteria')) {
      return 'eligibility_criteria';
    } else if (lowerQuery.includes('statistical') || lowerQuery.includes('analysis') || lowerQuery.includes('power')) {
      return 'statistical_analysis';
    } else if (lowerQuery.includes('regulatory') || lowerQuery.includes('fda') || lowerQuery.includes('ema')) {
      return 'regulatory';
    } else {
      return 'general';
    }
  }
  
  /**
   * Get agent service status
   */
  getStatus(): Record<string, any> {
    return {
      initialized: this.initialized,
      clinicalIntelligence: clinicalIntelligenceService.getIndexStats(),
      academicKnowledge: academicKnowledgeService.getStats()
    };
  }
}

// Export a singleton instance for convenience
export const studyDesignAgentService = new StudyDesignAgentService();