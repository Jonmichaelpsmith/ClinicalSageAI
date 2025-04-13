import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import * as archiver from 'archiver';
import { storage } from '../storage';

/**
 * Service for exporting and bundling study session data
 */
export class ExportService {
  private readonly basePath: string;
  
  constructor() {
    this.basePath = process.env.DATA_PATH || '/mnt/data/lumen_reports_backend';
  }
  
  /**
   * Creates a session archive bundle with all study artifacts
   * @param studyId - The ID of the study session
   * @param persona - The persona perspective (optional)
   * @returns Path to the generated ZIP file
   */
  async createSessionArchive(studyId: string, persona?: string): Promise<string> {
    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);
    const archiveDir = path.join(this.basePath, 'sessions', studyId);
    const zipFilename = `${studyId}_bundle_${timestamp}.zip`;
    const zipPath = path.join(this.basePath, 'exports', zipFilename);
    
    // Ensure directories exist
    await fsPromises.mkdir(path.join(this.basePath, 'exports'), { recursive: true });
    await fsPromises.mkdir(archiveDir, { recursive: true });
    
    // Get all study insights from database
    const insights = await this.getStudyInsights(studyId);
    
    // Create temporary files with content to be included in the archive
    await this.generateArchiveFiles(studyId, archiveDir, insights, persona);
    
    // Create the ZIP archive
    await this.createZipArchive(archiveDir, zipPath);
    
    return zipPath;
  }
  
  /**
   * Generate files to be included in the archive
   */
  private async generateArchiveFiles(
    studyId: string, 
    archiveDir: string, 
    insights: any[], 
    persona?: string
  ): Promise<void> {
    try {
      // Get protocol content if available
      const protocol = await this.getLatestProtocol(studyId);
      if (protocol) {
        await fsPromises.writeFile(
          path.join(archiveDir, 'protocol.txt'), 
          protocol.original || 'No protocol content available'
        );
        
        if (protocol.fixed) {
          await fsPromises.writeFile(
            path.join(archiveDir, 'protocol_repaired.txt'), 
            protocol.fixed
          );
        }
      }
      
      // Write insights to a JSON file
      await fsPromises.writeFile(
        path.join(archiveDir, 'study_insights.json'),
        JSON.stringify(insights, null, 2)
      );
      
      // Create manifest file with metadata
      const manifest = {
        study_id: studyId,
        persona: persona || 'unknown',
        generated_at: new Date().toISOString(),
        file_count: protocol ? (protocol.fixed ? 3 : 2) : 1,
        insight_count: insights.length
      };
      
      await fsPromises.writeFile(
        path.join(archiveDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      // Add any prediction results if available
      const predictionResults = await this.getPredictionResults(studyId);
      if (predictionResults) {
        await fsPromises.writeFile(
          path.join(archiveDir, 'success_prediction.json'),
          JSON.stringify(predictionResults, null, 2)
        );
      }
      
      // Add summary report if available
      const summaryReport = await this.getSummaryReport(studyId);
      if (summaryReport && summaryReport.content) {
        await fsPromises.writeFile(
          path.join(archiveDir, 'summary_report.md'),
          summaryReport.content
        );
      }
    } catch (error) {
      console.error('Error generating archive files:', error);
      throw new Error('Failed to generate session archive files');
    }
  }
  
  /**
   * Create a ZIP archive of the specified directory
   */
  private async createZipArchive(sourceDir: string, targetZip: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(targetZip);
      const archive = archiver.create('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      output.on('close', () => {
        console.log(`Archive created: ${targetZip} (${archive.pointer()} bytes)`);
        resolve();
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
  
  /**
   * Get the latest protocol content for a study
   */
  private async getLatestProtocol(studyId: string): Promise<any> {
    try {
      // This would typically be a database call
      // For now, we'll simulate the response
      const response = await fetch(`/api/protocol/get-latest?study_id=${studyId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching protocol:', error);
      return null;
    }
  }
  
  /**
   * Get all insights for a study
   */
  private async getStudyInsights(studyId: string): Promise<any[]> {
    try {
      // This would typically be a database call
      // For simplicity, we'll return a placeholder
      return [
        {
          title: "Protocol Validation",
          summary: "Protocol validated against regulatory standards",
          timestamp: new Date().toISOString(),
          status: "completed"
        },
        {
          title: "Sample Size Calculation",
          summary: "Calculated sample size of 120 total (60 per group)",
          timestamp: new Date().toISOString(),
          status: "completed"
        }
      ];
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }
  
  /**
   * Get prediction results for a study
   */
  private async getPredictionResults(studyId: string): Promise<any> {
    try {
      // This would typically be a database call
      return {
        probability: 0.83,
        method: "Monte Carlo simulation",
        factors: [
          { name: "Sample Size", impact: "positive" },
          { name: "Endpoint Selection", impact: "neutral" },
          { name: "Protocol Design", impact: "positive" }
        ]
      };
    } catch (error) {
      console.error('Error fetching prediction results:', error);
      return null;
    }
  }
  
  /**
   * Get summary report for a study
   */
  private async getSummaryReport(studyId: string): Promise<any> {
    try {
      // This would typically be a database call
      return {
        id: studyId,
        content: `# Study Summary Report\n\n## Protocol Overview\nThis is a Phase 2 clinical trial...\n\n## Key Findings\n- Sample size calculation: 120 participants\n- Estimated dropout rate: it`
      };
    } catch (error) {
      console.error('Error fetching summary report:', error);
      return null;
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();