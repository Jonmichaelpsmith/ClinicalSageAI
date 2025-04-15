import { db } from '../db';
import { clinicalEvaluationReports } from '../../shared/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { generateEmbeddings, generateStructuredResponse, isApiKeyAvailable } from '../openai-service';
import { SQL } from 'drizzle-orm/sql';

interface SemanticVariable {
  name: string;
  category: string;
  description: string;
  data_type: string;
  value_range?: string;
  related_variables: string[];
  importance_score: number;
  source_documents: string[];
}

interface SemanticConnection {
  source_variable: string;
  target_variable: string;
  relationship_type: string;
  strength: number;
  evidence: string[];
  confidence: number;
}

interface SemanticAnalysisResult {
  variables: SemanticVariable[];
  connections: SemanticConnection[];
  clusters: {
    name: string;
    variables: string[];
    description: string;
  }[];
  causal_paths: {
    path: string[];
    description: string;
    confidence: number;
  }[];
}

/**
 * Clinical Intelligence Service
 * 
 * This service provides deep semantic analysis of CSR and CER data,
 * identifying patterns, correlations, and causal relationships between
 * variables across documents.
 */
class ClinicalIntelligenceService {
  private static instance: ClinicalIntelligenceService;
  private semanticVariableCache: Map<string, SemanticVariable> = new Map();
  private semanticConnectionCache: Map<string, SemanticConnection[]> = new Map();

  private constructor() {
    // Initialize service
  }

  public static getInstance(): ClinicalIntelligenceService {
    if (!ClinicalIntelligenceService.instance) {
      ClinicalIntelligenceService.instance = new ClinicalIntelligenceService();
    }
    return ClinicalIntelligenceService.instance;
  }

  /**
   * Generate embeddings for semantic search across CSR and CER data
   */
  public async generateDocumentEmbeddings(documentId: string, documentType: 'CSR' | 'CER'): Promise<boolean> {
    try {
      if (!isApiKeyAvailable()) {
        console.error('OpenAI API key not available');
        return false;
      }

      let documentText: string;
      
      if (documentType === 'CER') {
        const [cer] = await db
          .select({ content: clinicalEvaluationReports.content_text })
          .from(clinicalEvaluationReports)
          .where(eq(clinicalEvaluationReports.cer_id, documentId));
        
        if (!cer) {
          console.error(`CER ${documentId} not found`);
          return false;
        }
        
        documentText = cer.content;
      } else {
        // Replace with CSR retrieval logic
        const [csr] = await db.execute(
          'SELECT content_text FROM csr_reports WHERE report_id = $1',
          [documentId]
        );
        
        if (!csr) {
          console.error(`CSR ${documentId} not found`);
          return false;
        }
        
        documentText = csr.content_text;
      }
      
      // Generate embeddings
      const embeddings = await generateEmbeddings(documentText);
      
      if (!embeddings) {
        console.error(`Failed to generate embeddings for ${documentType} ${documentId}`);
        return false;
      }
      
      // Store embeddings
      if (documentType === 'CER') {
        await db
          .update(clinicalEvaluationReports)
          .set({ content_vector: JSON.stringify(embeddings) })
          .where(eq(clinicalEvaluationReports.cer_id, documentId));
      } else {
        // Replace with CSR update logic
        await db.execute(
          'UPDATE csr_reports SET content_vector = $1 WHERE report_id = $2',
          [JSON.stringify(embeddings), documentId]
        );
      }
      
      return true;
    } catch (error) {
      console.error(`Error generating document embeddings: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract semantic variables from a document
   */
  public async extractSemanticVariables(documentId: string, documentType: 'CSR' | 'CER'): Promise<SemanticVariable[]> {
    try {
      if (!isApiKeyAvailable()) {
        console.error('OpenAI API key not available');
        return [];
      }

      let documentText: string;
      let documentMeta: any = {};
      
      if (documentType === 'CER') {
        const [cer] = await db
          .select()
          .from(clinicalEvaluationReports)
          .where(eq(clinicalEvaluationReports.cer_id, documentId));
        
        if (!cer) {
          console.error(`CER ${documentId} not found`);
          return [];
        }
        
        documentText = cer.content_text;
        documentMeta = {
          title: cer.title,
          device_name: cer.device_name,
          manufacturer: cer.manufacturer,
          indication: cer.indication
        };
      } else {
        // Replace with CSR retrieval logic
        const [csr] = await db.execute(
          'SELECT * FROM csr_reports WHERE report_id = $1',
          [documentId]
        );
        
        if (!csr) {
          console.error(`CSR ${documentId} not found`);
          return [];
        }
        
        documentText = csr.content_text;
        documentMeta = {
          title: csr.title,
          indication: csr.indication,
          phase: csr.phase,
          sponsor: csr.sponsor
        };
      }
      
      // Analyze document content to extract variables
      const prompt = `
        As an expert in clinical study reports and clinical evaluation reports, analyze the following ${documentType} document and extract all important semantic variables.
        
        Document Information:
        Title: ${documentMeta.title}
        ${documentType === 'CER' ? `Device: ${documentMeta.device_name}
        Manufacturer: ${documentMeta.manufacturer}` : `Phase: ${documentMeta.phase}
        Sponsor: ${documentMeta.sponsor}`}
        Indication: ${documentMeta.indication}
        
        For each variable, provide:
        1. name: The name of the variable
        2. category: The category (e.g., efficacy, safety, demographic, etc.)
        3. description: A clear description of what the variable represents
        4. data_type: The data type (continuous, categorical, binary, etc.)
        5. value_range: The possible range of values (if applicable)
        6. related_variables: Names of other variables that are related to this one
        7. importance_score: A score from 1-10 indicating the variable's importance
        8. source_documents: Set this to ["${documentId}"]
        
        Document Text (excerpt):
        ${documentText.substring(0, 10000)}
        
        Return a JSON array of semantic variables.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error(`Failed to extract semantic variables for ${documentType} ${documentId}`);
        return [];
      }
      
      // Parse the response
      let variables: SemanticVariable[] = [];
      try {
        variables = JSON.parse(response);
        
        // Cache the variables
        variables.forEach(variable => {
          this.semanticVariableCache.set(`${variable.name}_${documentId}`, variable);
        });
        
        return variables;
      } catch (error) {
        console.error(`Error parsing variables response: ${error.message}`);
        return [];
      }
    } catch (error) {
      console.error(`Error extracting semantic variables: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze connections between semantic variables across documents
   */
  public async analyzeSemanticConnections(
    variables: SemanticVariable[], 
    documentId: string
  ): Promise<SemanticConnection[]> {
    try {
      if (!isApiKeyAvailable() || variables.length === 0) {
        return [];
      }
      
      // Get cached connections if available
      if (this.semanticConnectionCache.has(documentId)) {
        return this.semanticConnectionCache.get(documentId);
      }
      
      // Prepare variables for analysis
      const variableNames = variables.map(v => v.name).join(', ');
      const variableSummaries = variables.map(v => `${v.name}: ${v.description} (${v.category})`).join('\n');
      
      const prompt = `
        As an expert in clinical data analysis, analyze the relationships between the following variables from ${documentId}:
        
        ${variableSummaries}
        
        For each meaningful relationship between variables, provide:
        1. source_variable: The name of the source variable
        2. target_variable: The name of the target variable
        3. relationship_type: The type of relationship (correlation, causation, dependency, etc.)
        4. strength: A value between 0-1 indicating the strength of the relationship
        5. evidence: Brief evidence points supporting this relationship
        6. confidence: A value between 0-1 indicating your confidence in this relationship
        
        Focus only on the most significant and well-supported relationships. 
        Return a JSON array of semantic connections.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error(`Failed to analyze semantic connections for ${documentId}`);
        return [];
      }
      
      // Parse the response
      let connections: SemanticConnection[] = [];
      try {
        connections = JSON.parse(response);
        
        // Cache the connections
        this.semanticConnectionCache.set(documentId, connections);
        
        return connections;
      } catch (error) {
        console.error(`Error parsing connections response: ${error.message}`);
        return [];
      }
    } catch (error) {
      console.error(`Error analyzing semantic connections: ${error.message}`);
      return [];
    }
  }

  /**
   * Perform a complete semantic analysis of a document
   */
  public async performSemanticAnalysis(documentId: string, documentType: 'CSR' | 'CER'): Promise<SemanticAnalysisResult> {
    try {
      // Extract variables
      const variables = await this.extractSemanticVariables(documentId, documentType);
      
      // Analyze connections
      const connections = await this.analyzeSemanticConnections(variables, documentId);
      
      // Identify variable clusters
      const clusters = await this.identifyVariableClusters(variables, connections);
      
      // Analyze causal pathways
      const causalPaths = await this.analyzeCausalPathways(connections);
      
      return {
        variables,
        connections,
        clusters,
        causal_paths: causalPaths
      };
    } catch (error) {
      console.error(`Error performing semantic analysis: ${error.message}`);
      return {
        variables: [],
        connections: [],
        clusters: [],
        causal_paths: []
      };
    }
  }

  /**
   * Identify clusters of related variables
   */
  private async identifyVariableClusters(
    variables: SemanticVariable[],
    connections: SemanticConnection[]
  ): Promise<{ name: string; variables: string[]; description: string }[]> {
    if (variables.length === 0 || connections.length === 0) {
      return [];
    }
    
    try {
      // Build an adjacency map for variable connections
      const adjacencyMap = new Map<string, Set<string>>();
      
      variables.forEach(variable => {
        adjacencyMap.set(variable.name, new Set<string>());
      });
      
      connections.forEach(connection => {
        const { source_variable, target_variable } = connection;
        
        if (adjacencyMap.has(source_variable)) {
          adjacencyMap.get(source_variable)?.add(target_variable);
        }
        
        if (adjacencyMap.has(target_variable)) {
          adjacencyMap.get(target_variable)?.add(source_variable);
        }
      });
      
      // Prepare data for the clustering prompt
      const variableSummaries = variables.map(v => `${v.name}: ${v.description} (${v.category})`).join('\n');
      const connectionSummaries = connections.map(c => 
        `${c.source_variable} -> ${c.target_variable} (${c.relationship_type}, strength: ${c.strength})`
      ).join('\n');
      
      const prompt = `
        As an expert in clinical data analysis, identify meaningful clusters of related variables from the following data:
        
        Variables:
        ${variableSummaries}
        
        Connections:
        ${connectionSummaries}
        
        For each cluster, provide:
        1. name: A descriptive name for the cluster
        2. variables: Array of variable names in this cluster
        3. description: A brief description of what this cluster represents
        
        Identify 3-7 clusters that best represent the natural groupings in this data.
        Return a JSON array of clusters.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error('Failed to identify variable clusters');
        return [];
      }
      
      // Parse the response
      return JSON.parse(response);
    } catch (error) {
      console.error(`Error identifying variable clusters: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze causal pathways between variables
   */
  private async analyzeCausalPathways(
    connections: SemanticConnection[]
  ): Promise<{ path: string[]; description: string; confidence: number }[]> {
    if (connections.length === 0) {
      return [];
    }
    
    try {
      // Filter for causal connections
      const causalConnections = connections.filter(c => 
        c.relationship_type.toLowerCase().includes('caus') && c.strength > 0.5
      );
      
      if (causalConnections.length === 0) {
        return [];
      }
      
      // Prepare data for the causal analysis prompt
      const connectionSummaries = causalConnections.map(c => 
        `${c.source_variable} -> ${c.target_variable} (${c.relationship_type}, strength: ${c.strength}, confidence: ${c.confidence})`
      ).join('\n');
      
      const prompt = `
        As an expert in clinical causal analysis, identify meaningful causal pathways from the following connections:
        
        Causal Connections:
        ${connectionSummaries}
        
        For each causal pathway, provide:
        1. path: An array of variable names representing the causal chain
        2. description: A clear description of the causal mechanism
        3. confidence: A value between 0-1 indicating your confidence in this pathway
        
        Focus on pathways with strong evidence and clinical relevance.
        Return a JSON array of causal pathways.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error('Failed to analyze causal pathways');
        return [];
      }
      
      // Parse the response
      return JSON.parse(response);
    } catch (error) {
      console.error(`Error analyzing causal pathways: ${error.message}`);
      return [];
    }
  }

  /**
   * Perform a cross-document semantic analysis to find patterns across multiple documents
   */
  public async performCrossDocumentAnalysis(
    documentIds: string[],
    documentTypes: ('CSR' | 'CER')[]
  ): Promise<{
    common_variables: SemanticVariable[];
    cross_document_connections: SemanticConnection[];
    key_insights: string[];
  }> {
    try {
      if (documentIds.length === 0 || documentIds.length !== documentTypes.length) {
        throw new Error('Invalid document inputs for cross-document analysis');
      }
      
      // Extract variables from all documents
      const allVariablesPromises = documentIds.map((id, index) => 
        this.extractSemanticVariables(id, documentTypes[index])
      );
      
      const allVariablesArrays = await Promise.all(allVariablesPromises);
      
      // Flatten variables and group by name
      const variablesByName = new Map<string, SemanticVariable[]>();
      
      allVariablesArrays.forEach((variables, docIndex) => {
        variables.forEach(variable => {
          if (!variablesByName.has(variable.name)) {
            variablesByName.set(variable.name, []);
          }
          variablesByName.get(variable.name)?.push({
            ...variable,
            source_documents: [documentIds[docIndex]]
          });
        });
      });
      
      // Identify common variables (present in at least 2 documents)
      const commonVariables: SemanticVariable[] = [];
      
      variablesByName.forEach((variables, name) => {
        if (variables.length >= 2) {
          // Merge variable definitions
          const mergedVariable: SemanticVariable = {
            name,
            category: variables[0].category,
            description: variables[0].description,
            data_type: variables[0].data_type,
            value_range: variables[0].value_range,
            related_variables: Array.from(new Set(variables.flatMap(v => v.related_variables))),
            importance_score: Math.max(...variables.map(v => v.importance_score)),
            source_documents: Array.from(new Set(variables.flatMap(v => v.source_documents)))
          };
          
          commonVariables.push(mergedVariable);
        }
      });
      
      // If no common variables, return early
      if (commonVariables.length === 0) {
        return {
          common_variables: [],
          cross_document_connections: [],
          key_insights: ['No common variables found across documents']
        };
      }
      
      // Analyze connections across documents
      const documentDescriptions = documentIds.map((id, i) => 
        `${documentTypes[i]} ${id}`
      ).join(', ');
      
      const commonVarSummaries = commonVariables.map(v => 
        `${v.name}: ${v.description} (${v.category}, appears in: ${v.source_documents.join(', ')})`
      ).join('\n');
      
      const prompt = `
        As an expert in clinical data analysis, identify meaningful cross-document relationships between these common variables found across ${documentDescriptions}:
        
        Common Variables:
        ${commonVarSummaries}
        
        For each relationship between variables, provide:
        1. source_variable: The name of the source variable
        2. target_variable: The name of the target variable
        3. relationship_type: The type of relationship (correlation, causation, dependency, etc.)
        4. strength: A value between 0-1 indicating the strength of the relationship
        5. evidence: Brief evidence points supporting this relationship
        6. confidence: A value between 0-1 indicating your confidence in this relationship
        
        Also provide a list of key insights gained from this cross-document analysis.
        
        Return a JSON object with "cross_document_connections" array and "key_insights" array.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error('Failed to perform cross-document analysis');
        return {
          common_variables: commonVariables,
          cross_document_connections: [],
          key_insights: ['Analysis failed to generate results']
        };
      }
      
      // Parse the response
      const analysisResult = JSON.parse(response);
      
      return {
        common_variables: commonVariables,
        cross_document_connections: analysisResult.cross_document_connections || [],
        key_insights: analysisResult.key_insights || []
      };
    } catch (error) {
      console.error(`Error in cross-document analysis: ${error.message}`);
      return {
        common_variables: [],
        cross_document_connections: [],
        key_insights: [`Error: ${error.message}`]
      };
    }
  }

  /**
   * Generate intelligence insights for clinical trial planning
   */
  public async generateClinicalTrialInsights(
    indication: string,
    phase: string
  ): Promise<{
    key_variables: { name: string; importance: number; description: string }[];
    risk_factors: { factor: string; impact: string; mitigation: string }[];
    endpoint_recommendations: { endpoint: string; justification: string; precedent_sources: string[] }[];
    design_considerations: string[];
  }> {
    try {
      // Find relevant CSRs and CERs for this indication and phase
      const relevantCSRs = await db.execute(
        'SELECT report_id FROM csr_reports WHERE indication ILIKE $1 AND phase = $2 AND "deletedAt" IS NULL LIMIT 10',
        [`%${indication}%`, phase]
      );
      
      const relevantCERs = await db
        .select({ cer_id: clinicalEvaluationReports.cer_id })
        .from(clinicalEvaluationReports)
        .where(
          and(
            like(clinicalEvaluationReports.indication, `%${indication}%`),
            isNull(clinicalEvaluationReports.deletedAt)
          )
        )
        .limit(10);
      
      // Combine document IDs
      const csrIds = relevantCSRs.map(csr => csr.report_id);
      const cerIds = relevantCERs.map(cer => cer.cer_id);
      
      const documentIds = [...csrIds, ...cerIds];
      const documentTypes = [...csrIds.map(() => 'CSR' as const), ...cerIds.map(() => 'CER' as const)];
      
      if (documentIds.length === 0) {
        return {
          key_variables: [],
          risk_factors: [],
          endpoint_recommendations: [],
          design_considerations: [
            'Insufficient data for the specified indication and phase'
          ]
        };
      }
      
      // Perform cross-document analysis
      const crossDocAnalysis = await this.performCrossDocumentAnalysis(
        documentIds,
        documentTypes
      );
      
      // Extract key variables (sorted by importance)
      const keyVariables = crossDocAnalysis.common_variables
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10)
        .map(v => ({
          name: v.name,
          importance: v.importance_score,
          description: v.description
        }));
      
      // Generate clinical trial insights prompt
      const prompt = `
        As an expert in clinical trial design, generate insights for planning a Phase ${phase} clinical trial for ${indication}, based on the following intelligence:
        
        Key Variables:
        ${keyVariables.map(v => `${v.name}: ${v.description} (Importance: ${v.importance})`).join('\n')}
        
        Cross-Document Insights:
        ${crossDocAnalysis.key_insights.join('\n')}
        
        Provide:
        1. risk_factors: Array of objects with "factor", "impact", and "mitigation" fields
        2. endpoint_recommendations: Array of objects with "endpoint", "justification", and "precedent_sources" fields
        3. design_considerations: Array of strings with important design considerations
        
        Focus on practical, evidence-based recommendations drawn from the provided intelligence.
        Return a JSON object with the above fields.
      `;
      
      const response = await generateStructuredResponse(prompt);
      
      if (!response) {
        console.error('Failed to generate clinical trial insights');
        return {
          key_variables: keyVariables,
          risk_factors: [],
          endpoint_recommendations: [],
          design_considerations: ['Analysis failed to generate results']
        };
      }
      
      // Parse the response
      const insightsResult = JSON.parse(response);
      
      return {
        key_variables: keyVariables,
        risk_factors: insightsResult.risk_factors || [],
        endpoint_recommendations: insightsResult.endpoint_recommendations || [],
        design_considerations: insightsResult.design_considerations || []
      };
    } catch (error) {
      console.error(`Error generating clinical trial insights: ${error.message}`);
      return {
        key_variables: [],
        risk_factors: [],
        endpoint_recommendations: [],
        design_considerations: [`Error: ${error.message}`]
      };
    }
  }
}

// Export the singleton instance
export const clinicalIntelligenceService = ClinicalIntelligenceService.getInstance();