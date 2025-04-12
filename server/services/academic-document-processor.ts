import { huggingFaceService, HFModel } from '../huggingface-service';
import { academicKnowledgeService } from './academic-knowledge-service';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: string;
  modDate?: string;
  pageCount?: number;
}

interface ProcessedAcademicDocument {
  id: string;
  fileName: string;
  metadata: PdfMetadata;
  extractedText: string;
  type: 'paper' | 'guideline' | 'book' | 'report' | 'other';
  source: string;
  year: number;
  title: string;
  summary: string;
  tags: string[];
  keyInsights: string[];
  success: boolean;
  error?: string;
}

/**
 * Service for processing academic documents (PDF, etc.)
 */
export class AcademicDocumentProcessor {
  private tempDir: string;
  private embeddingsDir: string;
  
  constructor() {
    // Create temp directory for processing
    this.tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    // Create directory for embeddings
    this.embeddingsDir = path.join(process.cwd(), 'academic_embeddings');
    if (!fs.existsSync(this.embeddingsDir)) {
      fs.mkdirSync(this.embeddingsDir, { recursive: true });
    }
  }
  
  /**
   * Process a PDF file and extract academic knowledge
   */
  async processPdfDocument(filePath: string): Promise<ProcessedAcademicDocument> {
    const fileName = path.basename(filePath);
    const id = uuidv4();
    const processingResult: ProcessedAcademicDocument = {
      id,
      fileName,
      metadata: {},
      extractedText: '',
      type: 'other',
      source: 'Unknown',
      year: new Date().getFullYear(),
      title: fileName.replace('.pdf', '').replace(/_/g, ' '),
      summary: '',
      tags: [],
      keyInsights: [],
      success: false
    };
    
    try {
      console.log(`Processing academic document: ${fileName}`);
      
      // Extract text from PDF
      let extractedText = await this.extractTextFromPdf(filePath);
      
      // Truncate if too large
      if (extractedText.length > 100000) {
        console.log(`Document text is very large (${extractedText.length} chars), truncating...`);
        extractedText = extractedText.substring(0, 100000) + '...';
      }
      
      processingResult.extractedText = extractedText;
      
      // Extract metadata from PDF
      processingResult.metadata = await this.extractPdfMetadata(filePath);
      
      // Try to determine document type and source
      const documentInfo = await this.analyzeDocumentType(extractedText, processingResult.metadata);
      processingResult.type = documentInfo.type;
      processingResult.source = documentInfo.source;
      processingResult.year = documentInfo.year;
      processingResult.title = documentInfo.title || processingResult.title;
      
      // Generate summary
      processingResult.summary = await this.generateDocumentSummary(extractedText, processingResult.title);
      
      // Extract key insights
      processingResult.keyInsights = await this.extractKeyInsights(extractedText, processingResult.title, processingResult.type);
      
      // Generate tags
      processingResult.tags = await this.generateTags(extractedText, processingResult.summary);
      
      // Mark as successful
      processingResult.success = true;
      
      // Add to academic knowledge base
      await this.addToKnowledgeBase(processingResult);
      
      return processingResult;
    } catch (error) {
      console.error(`Error processing document ${fileName}:`, error);
      processingResult.error = error instanceof Error ? error.message : 'Unknown error';
      return processingResult;
    }
  }
  
  /**
   * Extract text from a PDF file
   */
  private async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      // For this to work in production, we'd use a proper PDF extraction library like pdf-parse,
      // pdfjs-dist, or call out to a Python service using PyMuPDF
      // Here we'll emulate this with a shell command
      
      // For now, return a simplified extraction approach
      console.log(`Extracting text from ${filePath}...`);
      
      // Find installed PDF extraction tool
      const pdfExtractAvailable = await this.checkPdfToolAvailability();
      
      if (pdfExtractAvailable) {
        // Use shell command to extract text
        const { execSync } = require('child_process');
        
        const outputPath = path.join(this.tempDir, `${path.basename(filePath, '.pdf')}.txt`);
        
        try {
          // Try using pdftotext if available
          execSync(`pdftotext "${filePath}" "${outputPath}"`);
          
          if (fs.existsSync(outputPath)) {
            const text = fs.readFileSync(outputPath, 'utf8');
            // Clean up
            fs.unlinkSync(outputPath);
            return text;
          }
        } catch (err) {
          console.error('Error using pdftotext:', err);
        }
      }
      
      // Fallback - read a few bytes of the PDF to check if it's binary
      const buffer = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
      const isPdfBinary = buffer.slice(0, 100).includes('%PDF');
      
      if (isPdfBinary) {
        console.log('File is binary PDF, but extraction tools not available. Using HuggingFace for analysis.');
        
        // We'll use HuggingFace to help us analyze the content by having it summarize what it sees
        return `[This is a PDF document titled "${path.basename(filePath, '.pdf').replace(/_/g, ' ')}" that requires PDF extraction tools for complete processing.]`;
      } else {
        // If the file is actually text-based, return its content
        return buffer;
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Check if PDF extraction tools are available
   */
  private async checkPdfToolAvailability(): Promise<boolean> {
    try {
      const { execSync } = require('child_process');
      execSync('which pdftotext');
      return true;
    } catch (err) {
      return false;
    }
  }
  
  /**
   * Extract metadata from a PDF file
   */
  private async extractPdfMetadata(filePath: string): Promise<PdfMetadata> {
    try {
      // In a production environment, we'd use a proper PDF library
      // For now, return some basic metadata based on the file itself
      const stats = fs.statSync(filePath);
      
      return {
        title: path.basename(filePath, '.pdf').replace(/_/g, ' '),
        creator: 'Unknown',
        producer: 'Unknown',
        creationDate: stats.birthtime.toISOString(),
        modDate: stats.mtime.toISOString(),
        pageCount: 0 // Can't determine without proper PDF library
      };
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      return {};
    }
  }
  
  /**
   * Analyze the document to determine its type, source, and year
   */
  private async analyzeDocumentType(text: string, metadata: PdfMetadata): Promise<{
    type: 'paper' | 'guideline' | 'book' | 'report' | 'other';
    source: string;
    year: number;
    title?: string;
  }> {
    // Use HuggingFace to analyze the document
    try {
      const prompt = `
Analyze the following excerpt from an academic or regulatory document and determine:
1. Document type (one of: paper, guideline, book, report, other)
2. Source (journal name, organization, or publisher)
3. Publication year (as a 4-digit number)
4. Title (the full title of the document)

DOCUMENT EXCERPT:
${text.substring(0, 2000)}...

Respond with valid JSON in this format:
{
  "type": "paper|guideline|book|report|other",
  "source": "source name",
  "year": YYYY,
  "title": "document title"
}
`;

      const response = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        500,
        0.3
      );
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          
          // Validate year
          const currentYear = new Date().getFullYear();
          if (result.year < 1900 || result.year > currentYear) {
            result.year = currentYear;
          }
          
          // If title is from metadata, keep it
          if (metadata.title && metadata.title.length > 10) {
            result.title = metadata.title;
          }
          
          return {
            type: result.type as any,
            source: result.source,
            year: result.year,
            title: result.title
          };
        } catch (jsonError) {
          console.error('Error parsing document analysis JSON:', jsonError);
        }
      }
    } catch (error) {
      console.error('Error analyzing document type:', error);
    }
    
    // Default values if analysis fails
    return {
      type: 'other',
      source: metadata.creator || 'Unknown',
      year: new Date().getFullYear(),
      title: metadata.title
    };
  }
  
  /**
   * Generate a summary of the document
   */
  private async generateDocumentSummary(text: string, title: string): Promise<string> {
    try {
      const prompt = `
Generate a comprehensive summary of the following academic document:

TITLE: ${title}

CONTENT:
${text.substring(0, 3000)}...

Your summary should cover:
1. Main purpose or research question
2. Methodology or approach
3. Key findings or guidance
4. Significance or implications

Write a concise but informative summary in 3-4 paragraphs (250-300 words). Be specific and focused on the content provided.
`;

      const summary = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        600,
        0.3
      );
      
      return summary;
    } catch (error) {
      console.error('Error generating document summary:', error);
      return `Document titled "${title}" appears to discuss academic or regulatory content related to clinical trials or research methodology.`;
    }
  }
  
  /**
   * Extract key insights from the document
   */
  private async extractKeyInsights(text: string, title: string, type: string): Promise<string[]> {
    try {
      const prompt = `
Extract the 5 most important insights from this ${type} titled "${title}".

DOCUMENT EXCERPT:
${text.substring(0, 3500)}...

For each insight:
1. Focus on specific findings, methodologies, or recommendations
2. Provide detailed, actionable information
3. Prioritize novel or significant contributions

Format each insight as a single paragraph with specific information. Number your insights from 1 to 5.
`;

      const insightsText = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        800,
        0.3
      );
      
      // Parse the numbered insights
      const insights = insightsText
        .split(/\n\s*\d+\.|\n\s*-/)
        .map(insight => insight.trim())
        .filter(insight => insight.length > 20)
        .slice(0, 5);
      
      return insights;
    } catch (error) {
      console.error('Error extracting key insights:', error);
      return [
        `The document "${title}" contains potentially valuable information related to clinical research or regulatory guidance.`
      ];
    }
  }
  
  /**
   * Generate tags for the document
   */
  private async generateTags(text: string, summary: string): Promise<string[]> {
    try {
      const prompt = `
Based on the following document summary and excerpt, generate 8-10 specific tags (keywords) that accurately represent the main topics and themes. Focus on precision, specificity, and relevance.

SUMMARY:
${summary}

DOCUMENT EXCERPT:
${text.substring(0, 1500)}...

Generate single or compound word tags without descriptions. Tags should be lowercase. Return the tags as a JSON array.
`;

      const tagsResponse = await huggingFaceService.queryHuggingFace(
        prompt,
        HFModel.MISTRAL_LATEST,
        300,
        0.3
      );
      
      // Try to extract JSON array
      const jsonMatch = tagsResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const tags = JSON.parse(jsonMatch[0]);
          if (Array.isArray(tags) && tags.length > 0) {
            return tags.map(tag => tag.toLowerCase()).slice(0, 10);
          }
        } catch (jsonError) {
          console.error('Error parsing tags JSON:', jsonError);
        }
      }
      
      // If JSON parsing fails, extract words from response
      const tagWords = tagsResponse
        .split(/[,\n]/)
        .map(tag => {
          // Clean up tag text
          return tag.trim().replace(/^["'\s\-•]+|["'\s\-•]+$/g, '').toLowerCase();
        })
        .filter(tag => tag.length > 2 && tag.length < 30)
        .slice(0, 10);
      
      return tagWords;
    } catch (error) {
      console.error('Error generating tags:', error);
      
      // Extract potential tags from the title and summary
      const combined = `${summary} ${text.substring(0, 500)}`;
      const words = combined.toLowerCase().split(/\W+/);
      const potentialTags = [...new Set(words.filter(word => word.length > 4 && word.length < 15))];
      
      return potentialTags.slice(0, 8);
    }
  }
  
  /**
   * Add the processed document to the knowledge base
   */
  private async addToKnowledgeBase(document: ProcessedAcademicDocument): Promise<void> {
    try {
      // Create an academic resource from the processed document
      const resource = {
        id: document.id,
        title: document.title,
        type: document.type,
        source: document.source,
        year: document.year,
        content: `${document.summary}\n\n${document.extractedText}`,
        metadata: {
          fileName: document.fileName,
          pdfMetadata: document.metadata,
          insights: document.keyInsights,
          tags: document.tags,
          processingDate: new Date().toISOString()
        }
      };
      
      // Add to academic knowledge service
      await academicKnowledgeService.addResource(resource);
      
      console.log(`Added document "${document.title}" to academic knowledge base`);
    } catch (error) {
      console.error('Error adding document to knowledge base:', error);
      throw error;
    }
  }
  
  /**
   * Get the list of recently processed documents
   */
  async getRecentlyProcessedDocuments(limit: number = 10): Promise<Array<{
    id: string;
    title: string;
    type: string;
    source: string;
    year: number;
    processingDate: string;
  }>> {
    // Get all resources from academic knowledge service
    const resources = academicKnowledgeService.getAllResources();
    
    // Sort by processing date (most recent first)
    const sorted = resources
      .filter(r => r.metadata && r.metadata.processingDate)
      .sort((a, b) => {
        const dateA = new Date(a.metadata.processingDate).getTime();
        const dateB = new Date(b.metadata.processingDate).getTime();
        return dateB - dateA;
      });
    
    // Return limited list with relevant fields
    return sorted.slice(0, limit).map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      source: r.source,
      year: r.year,
      processingDate: r.metadata.processingDate
    }));
  }
}

// Export a singleton instance
export const academicDocumentProcessor = new AcademicDocumentProcessor();