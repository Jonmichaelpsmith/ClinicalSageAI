/**
 * Deep CSR Analyzer - Integration between Express server and Python deep CSR analysis service
 * 
 * This module provides a bridge between the JavaScript/TypeScript Express server
 * and the Python-based deep CSR semantic analysis system.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Define interface for CSR reference
export interface CSRReference {
  csr_id: string;
  title?: string;
  citation_type?: 'explicit' | 'semantic';
  relevance?: 'high' | 'medium' | 'low';
  context?: string;
  metadata?: Record<string, any>;
}

/**
 * Extract CSR references from text using the deep semantic analysis system
 * 
 * @param text Text to analyze for CSR references
 * @returns Array of CSR references
 */
export async function extractCsrReferences(text: string): Promise<CSRReference[]> {
  try {
    // Create a temporary file to store the text
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFileName = `csr_extract_${Date.now()}.txt`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Write the text to extract to the temp file
    fs.writeFileSync(tempFilePath, text);
    
    // Call the Python script to analyze the text
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['trialsage/extract_references.py', tempFilePath]);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, err);
        }
        
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorData}`);
          
          // Fallback to basic pattern matching if Python fails
          const basicReferences = extractBasicReferences(text);
          resolve(basicReferences);
          return;
        }
        
        try {
          // Parse the JSON output from the Python script
          const citations = JSON.parse(resultData);
          resolve(citations);
        } catch (err) {
          console.error('Failed to parse Python output:', err);
          console.error('Python output was:', resultData);
          
          // Fallback to basic pattern matching
          const basicReferences = extractBasicReferences(text);
          resolve(basicReferences);
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkErr) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
        }
        
        // Fallback to basic pattern matching
        const basicReferences = extractBasicReferences(text);
        resolve(basicReferences);
      });
    });
  } catch (err) {
    console.error('Error in extractCsrReferences:', err);
    
    // Fallback to basic pattern matching
    return extractBasicReferences(text);
  }
}

/**
 * Simple pattern-based CSR reference extraction as fallback
 * 
 * @param text Text to analyze
 * @returns Array of basic CSR references
 */
function extractBasicReferences(text: string): CSRReference[] {
  const references: CSRReference[] = [];
  
  // Simple regex pattern for CSR IDs
  const csrPattern = /CSR[_\s-]?(\w+)/gi;
  const matches = [...text.matchAll(csrPattern)];
  
  const seenIds = new Set<string>();
  
  // Extract CSR IDs from matches
  for (const match of matches) {
    const csr_id = match[1];
    
    // Avoid duplicates
    if (seenIds.has(csr_id)) continue;
    seenIds.add(csr_id);
    
    // Create basic reference
    references.push({
      csr_id,
      citation_type: 'explicit',
      relevance: 'medium',
      title: `CSR ${csr_id}`,
      context: match[0]
    });
  }
  
  // If no matches were found, add a placeholder reference
  if (references.length === 0) {
    const keywords = [
      'study', 'trial', 'clinical', 'outcome', 'endpoint', 'efficacy', 
      'safety', 'adverse', 'dropout', 'intervention'
    ];
    
    // Check if any keywords are present
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        references.push({
          csr_id: 'semantic_match',
          citation_type: 'semantic',
          relevance: 'low',
          title: 'Semantic Match',
          context: `Contains keyword: ${keyword}`
        });
        break;
      }
    }
  }
  
  return references;
}

/**
 * Perform deep semantic search against the CSR knowledge base
 * 
 * @param query Search query
 * @param options Search options
 * @returns Search results
 */
export async function performDeepCsrSearch(
  query: string, 
  options: { 
    topK?: number; 
    filterByCsr?: string;
    searchType?: 'general' | 'endpoint' | 'eligibility' | 'safety' | 'efficacy';
  } = {}
): Promise<any> {
  try {
    // Create a temporary file to store the query
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFileName = `csr_search_${Date.now()}.json`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Write the query and options to the temp file
    fs.writeFileSync(tempFilePath, JSON.stringify({
      query,
      topK: options.topK || 5,
      filterByCsr: options.filterByCsr,
      searchType: options.searchType || 'general'
    }));
    
    // Call the Python script to perform the search
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['trialsage/semantic_search.py', tempFilePath]);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, err);
        }
        
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorData}`);
          resolve({ error: 'Failed to perform semantic search', results: [] });
          return;
        }
        
        try {
          // Parse the JSON output from the Python script
          const searchResults = JSON.parse(resultData);
          resolve(searchResults);
        } catch (err) {
          console.error('Failed to parse Python output:', err);
          console.error('Python output was:', resultData);
          resolve({ error: 'Failed to parse search results', results: [] });
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkErr) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
        }
        
        resolve({ error: 'Failed to start semantic search process', results: [] });
      });
    });
  } catch (err) {
    console.error('Error in performDeepCsrSearch:', err);
    return { error: 'Error performing semantic search', results: [] };
  }
}

/**
 * Generate evidence-based recommendations for study design using deep CSR analysis
 * 
 * @param params Parameters for design recommendations
 * @returns Design recommendations
 */
export async function generateStudyDesignRecommendations(
  params: {
    indication: string;
    phase: string;
    primaryEndpoint?: string;
    secondaryEndpoints?: string[];
    population?: string;
    context?: string;
  }
): Promise<any> {
  try {
    // Create a temporary file to store the parameters
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFileName = `design_request_${Date.now()}.json`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Write the parameters to the temp file
    fs.writeFileSync(tempFilePath, JSON.stringify(params));
    
    // Call the Python script to generate recommendations
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['trialsage/design_recommendations.py', tempFilePath]);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, err);
        }
        
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorData}`);
          resolve({ error: 'Failed to generate design recommendations', recommendations: [] });
          return;
        }
        
        try {
          // Parse the JSON output from the Python script
          const recommendations = JSON.parse(resultData);
          resolve(recommendations);
        } catch (err) {
          console.error('Failed to parse Python output:', err);
          console.error('Python output was:', resultData);
          resolve({ error: 'Failed to parse design recommendations', recommendations: [] });
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkErr) {
          console.warn(`Failed to delete temp file ${tempFilePath}:`, unlinkErr);
        }
        
        resolve({ error: 'Failed to start design recommendations process', recommendations: [] });
      });
    });
  } catch (err) {
    console.error('Error in generateStudyDesignRecommendations:', err);
    return { error: 'Error generating design recommendations', recommendations: [] };
  }
}