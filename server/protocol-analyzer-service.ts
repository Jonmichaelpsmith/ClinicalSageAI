/**
 * Protocol Analyzer Service
 * 
 * This service analyzes protocol text and extracts structured data
 * Used for protocol intelligence features in TrialSage
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class ProtocolAnalyzerService {
  /**
   * Parse protocol text and extract structured data
   */
  async parseProtocolText(text: string): Promise<any> {
    // Simple extraction of key parameters using regex patterns
    const indication = this.extractIndication(text);
    const phase = this.extractPhase(text);
    const sampleSize = this.extractSampleSize(text);
    const durationWeeks = this.extractDuration(text);
    const dropoutRate = this.extractDropoutRate(text);
    const endpointPrimary = this.extractPrimaryEndpoint(text);
    const endpointSecondary = this.extractSecondaryEndpoints(text);
    
    // Return structured protocol data
    return {
      indication,
      phase,
      sample_size: sampleSize,
      duration_weeks: durationWeeks,
      dropout_rate: dropoutRate,
      endpoint_primary: endpointPrimary,
      endpoint_secondary: endpointSecondary
    };
  }
  
  /**
   * Extract indication from protocol text
   */
  private extractIndication(text: string): string {
    const patterns = [
      /indication\s*(?:is|:)?\s*([^\.]+)/i,
      /(?:treating|treatment of|patients with)\s+([^\.]+)/i,
      /study (?:of|in|for)\s+(?:patients with)?\s*([^\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return "Unspecified indication";
  }
  
  /**
   * Extract phase from protocol text
   */
  private extractPhase(text: string): string {
    const phaseMatch = text.match(/phase\s*([0-9IViv]{1,3})/i);
    if (phaseMatch && phaseMatch[1]) {
      // Normalize Roman numerals to Arabic numerals
      const phase = phaseMatch[1].toUpperCase();
      if (phase === 'I') return '1';
      if (phase === 'II') return '2';
      if (phase === 'III') return '3';
      if (phase === 'IV') return '4';
      return phase;
    }
    return '2'; // Default to phase 2
  }
  
  /**
   * Extract sample size from protocol text
   */
  private extractSampleSize(text: string): number {
    const patterns = [
      /(?:sample size|n\s*=|n of|enrollment of|total of|approximately)\s*(\d+)\s*(?:subjects|patients|participants)?/i,
      /(\d+)\s*(?:subjects|patients|participants)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return 100; // Default sample size
  }
  
  /**
   * Extract duration from protocol text
   */
  private extractDuration(text: string): number {
    const weekPatterns = [
      /(?:duration|period|length) of\s*(\d+)\s*weeks/i,
      /(\d+)\s*-?\s*week study/i,
      /study (?:duration|period|length)(?:\s*is| of)?\s*(\d+)\s*weeks/i,
    ];
    
    const monthPatterns = [
      /(?:duration|period|length) of\s*(\d+)\s*months/i,
      /(\d+)\s*-?\s*month study/i,
      /study (?:duration|period|length)(?:\s*is| of)?\s*(\d+)\s*months/i,
    ];
    
    // Try to find week duration
    for (const pattern of weekPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Try to find month duration and convert to weeks
    for (const pattern of monthPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return Math.round(parseInt(match[1], 10) * 4.33); // Convert months to weeks
      }
    }
    
    return 12; // Default to 12 weeks
  }
  
  /**
   * Extract dropout rate from protocol text
   */
  private extractDropoutRate(text: string): number {
    const patterns = [
      /(?:dropout|attrition|discontinuation) rate of\s*(\d+(?:\.\d+)?)\s*%/i,
      /(\d+(?:\.\d+)?)\s*% (?:dropout|attrition|discontinuation) rate/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]) / 100; // Convert percentage to decimal
      }
    }
    
    return 0.15; // Default to 15% dropout rate
  }
  
  /**
   * Extract primary endpoint from protocol text
   */
  private extractPrimaryEndpoint(text: string): string {
    const patterns = [
      /primary endpoint(?:\s*is|\s*:)?\s*([^\.]+)/i,
      /primary (?:outcome|objective)(?:\s*is|\s*:)?\s*([^\.]+)/i,
      /primary efficacy endpoint(?:\s*is|\s*:)?\s*([^\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return "Change from baseline in disease activity";
  }
  
  /**
   * Extract secondary endpoints from protocol text
   */
  private extractSecondaryEndpoints(text: string): string[] {
    const secondarySection = text.match(/secondary (?:endpoints|outcomes|objectives)(?:\s*are|\s*include|\s*:)?([^\.]+(?:\.[^\.]+)*)/i);
    
    if (secondarySection && secondarySection[1]) {
      // Try to split by common delimiters
      const endpointsText = secondarySection[1].trim();
      
      // Try numbered or bulleted format first
      const numberedEndpoints = endpointsText.match(/(?:\d+\)|\d+\.|\-|\*)\s*([^\.]+)/g);
      if (numberedEndpoints) {
        return numberedEndpoints.map(item => {
          // Remove the numbering/bullet and trim
          return item.replace(/(?:\d+\)|\d+\.|\-|\*)\s*/, '').trim();
        });
      }
      
      // Try comma-separated format
      return endpointsText.split(/,|;/).map(endpoint => endpoint.trim()).filter(e => e.length > 0);
    }
    
    return []; // No secondary endpoints found
  }
  
  /**
   * Parse PDF file and extract protocol text
   */
  async parsePdfFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(process.cwd(), 'scripts', 'extract_pdf_text.py');
      const pythonProcess = spawn('python3', [pythonScript, filePath]);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`PDF extraction error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`PDF extraction failed: ${errorData}`));
        } else {
          resolve(resultData.trim());
        }
      });
    });
  }
}

export const protocolAnalyzerService = new ProtocolAnalyzerService();