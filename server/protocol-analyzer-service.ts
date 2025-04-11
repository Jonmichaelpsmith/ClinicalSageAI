import { db } from './db';
import { eq } from 'drizzle-orm';
import { csrReports } from '../shared/schema';

export interface ProtocolData {
  phase: string;
  indication: string;
  sample_size: number;
  duration_weeks: number;
  primary_endpoint: string;
  endpoint_primary?: string;
  secondary_endpoints?: string[];
  inclusion_criteria?: string;
  exclusion_criteria?: string;
  population?: string;
  design?: string;
  summary?: string;
  arms?: number;
}

export class ProtocolAnalyzerService {
  /**
   * Analyzes protocol text and extracts structured information
   */
  async analyzeProtocol(protocolText: string): Promise<ProtocolData> {
    try {
      if (!protocolText || typeof protocolText !== 'string') {
        throw new Error('Protocol text is required');
      }

      // Real implementation would use NLP/AI for text analysis
      // This is a simple implementation that extracts basic information

      // Create a normalized version of the text for searching
      const normalizedText = protocolText.toLowerCase();
      
      // Extract phase (simple pattern matching)
      const phaseMatch = normalizedText.match(/phase\s+([1-4i]+)/i) || 
                         normalizedText.match(/phase\s+(one|two|three|four|i{1,3}v?)/i);
      
      const phase = phaseMatch ? this.normalizePhase(phaseMatch[1]) : "Phase 2";
      
      // Extract indication
      const indicationMatch = normalizedText.match(/(?:indication|condition|disease):\s*([^\n\.]+)/i) ||
                              normalizedText.match(/(?:investigating|studying|trial for|treatment of)\s+([^\n\.]+)/i);
      
      const indication = indicationMatch ? indicationMatch[1].trim() : "Oncology";
      
      // Extract sample size
      const sampleSizeMatch = normalizedText.match(/(?:sample size|n\s*=|participants|subjects|patients):\s*(\d+)/i) ||
                              normalizedText.match(/(\d+)\s+(?:participants|subjects|patients)/i);
      
      const sample_size = sampleSizeMatch ? parseInt(sampleSizeMatch[1]) : 100;
      
      // Extract duration
      const durationMatch = normalizedText.match(/(?:duration|length|period):\s*(\d+)\s*(?:weeks|wks)/i) ||
                           normalizedText.match(/(\d+)\s*(?:weeks|wks)/i);
      
      const duration_weeks = durationMatch ? parseInt(durationMatch[1]) : 24;
      
      // Extract primary endpoint
      const endpointMatch = normalizedText.match(/(?:primary endpoint|primary outcome):\s*([^\n\.]+)/i) ||
                            normalizedText.match(/(?:primary endpoint|primary outcome)[^:]*?(?:is|will be)\s+([^\n\.]+)/i);
      
      const primary_endpoint = endpointMatch ? endpointMatch[1].trim() : "Overall Response Rate";
      
      // Extract secondary endpoints
      const secondaryEndpointsMatch = normalizedText.match(/(?:secondary endpoints|secondary outcomes):\s*([^\n]+)/i);
      
      const secondary_endpoints = secondaryEndpointsMatch ? 
        secondaryEndpointsMatch[1].split(/[;,]/).map(e => e.trim()) : 
        ["Progression-Free Survival", "Safety and Tolerability"];
      
      // Extract inclusion criteria
      const inclusionMatch = normalizedText.match(/(?:inclusion criteria|eligibility):\s*([^\n]+)/i);
      
      const inclusion_criteria = inclusionMatch ? inclusionMatch[1].trim() : undefined;
      
      // Extract exclusion criteria
      const exclusionMatch = normalizedText.match(/(?:exclusion criteria):\s*([^\n]+)/i);
      
      const exclusion_criteria = exclusionMatch ? exclusionMatch[1].trim() : undefined;
      
      // Extract population information
      const populationMatch = normalizedText.match(/(?:population|subjects|patients):\s*([^\n]+)/i);
      
      const population = populationMatch ? populationMatch[1].trim() : undefined;
      
      // Extract study design
      const designMatch = normalizedText.match(/(?:study design|trial design|design):\s*([^\n]+)/i);
      
      const design = designMatch ? designMatch[1].trim() : "Randomized, Double-Blind, Placebo-Controlled";
      
      // Extract number of arms
      const armsMatch = normalizedText.match(/(\d+)\s*(?:arms|groups)/i);
      
      const arms = armsMatch ? parseInt(armsMatch[1]) : 2;
      
      // Generate a summary (in a real implementation, this would use an AI summarizer)
      const summary = `Protocol for a ${phase} clinical trial investigating ${indication} with ${sample_size} participants over ${duration_weeks} weeks. The primary endpoint is ${primary_endpoint}.`;
      
      return {
        phase,
        indication,
        sample_size,
        duration_weeks,
        primary_endpoint,
        endpoint_primary: primary_endpoint,
        secondary_endpoints,
        inclusion_criteria,
        exclusion_criteria,
        population,
        design,
        summary,
        arms
      };
    } catch (error: any) {
      console.error('Error analyzing protocol text:', error);
      throw new Error(`Protocol analysis failed: ${error.message}`);
    }
  }

  /**
   * Normalize phase information to standard format
   */
  private normalizePhase(phase: string): string {
    phase = phase.toLowerCase();
    
    if (phase.match(/^i{1,3}v?$/i) || phase.match(/^[1-4]$/)) {
      return `Phase ${phase.toUpperCase()}`;
    }
    
    if (phase === 'one') return 'Phase I';
    if (phase === 'two') return 'Phase II';
    if (phase === 'three') return 'Phase III';
    if (phase === 'four') return 'Phase IV';
    
    return `Phase ${phase}`;
  }

  /**
   * Find similar CSR reports to the given protocol data
   */
  async findSimilarProtocols(protocolData: ProtocolData, limit: number = 5): Promise<any[]> {
    try {
      // Find similar reports by indication and phase
      const similar = await db.select().from(csr_reports)
        .where(eq(csr_reports.indication, protocolData.indication))
        .limit(limit);
        
      return similar.map(report => ({
        id: report.id,
        title: report.title,
        phase: report.phase, 
        indication: report.indication,
        similarity: Math.floor(Math.random() * 40) + 60, // Random similarity score for demo
        sampleSize: report.sampleSize || 100,
        duration: report.durationWeeks || 24,
        outcome: Math.random() > 0.3 ? 'success' : 'failed' // Random outcome for demo
      }));
    } catch (error) {
      console.error('Error finding similar protocols:', error);
      return [];
    }
  }
}

export const protocolAnalyzerService = new ProtocolAnalyzerService();