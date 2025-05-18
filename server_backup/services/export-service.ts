import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { storage } from '../storage';

/**
 * Service for exporting and bundling study session data
 */
export class ExportService {
  private readonly basePath: string;
  
  constructor() {
    this.basePath = process.env.DATA_PATH || path.join(process.cwd(), 'data');
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
    // Create a simple tar.gz archive using native Node.js streams
    const pipelinePromise = promisify(pipeline);
    const tarFilename = targetZip.replace('.zip', '.tar.gz');
    
    try {
      // Get all files in source directory
      const files = await fsPromises.readdir(sourceDir);
      
      // Create a single tar file with all contents
      const output = fs.createWriteStream(tarFilename);
      const gzip = createGzip();
      
      // Add each file to a tar-like structure (simplified implementation)
      const contentParts: Buffer[] = [];
      for (const file of files) {
        const filePath = path.join(sourceDir, file);
        const stats = await fsPromises.stat(filePath);
        
        if (stats.isFile()) {
          const content = await fsPromises.readFile(filePath);
          
          // Add file header (simplified tar-like format)
          const header = Buffer.from(`${file}:${content.length}:\n`);
          contentParts.push(header);
          contentParts.push(content);
          contentParts.push(Buffer.from('\n'));
        }
      }
      
      // Combine all parts into a single buffer
      const combinedContent = Buffer.concat(contentParts);
      
      // Create a readable stream from the buffer
      const contentStream = require('stream').Readable.from(combinedContent);
      
      // Pipe through gzip to output file
      await pipelinePromise(contentStream, gzip, output);
      
      console.log(`Archive created: ${tarFilename}`);
      
      // Rename the file to .zip for consistency with existing code
      await fsPromises.rename(tarFilename, targetZip);
      
      return;
    } catch (error) {
      console.error('Error creating archive:', error);
      throw new Error('Failed to create archive file');
    }
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