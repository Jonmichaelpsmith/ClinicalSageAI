/**
 * Similar Goals Search Routes for TrialSage
 * Handles API endpoints for finding CSRs with similar study goals
 * and analyzing them with AI
 */

import { db } from '../db';
import { csr_reports, csr_details } from '@shared/schema';
import { eq, like, desc, and } from 'drizzle-orm';
import { HuggingFaceService } from '../services/huggingface-service';

/**
 * Find CSRs with study goals similar to the provided goal text
 */
export async function findSimilarGoalsByText(req, res) {
  try {
    const { 
      goalText, 
      minSimilarity = 0.6, 
      maxResults = 10,
      includeEndpoints = true,
      includeAdverseEvents = true,
      includeSampleSize = true,
      searchType = 'semantic'
    } = req.body;
    
    if (!goalText) {
      return res.status(400).json({ error: 'Goal text is required' });
    }
    
    // Call Hugging Face service to get embeddings for the goal text
    const hfService = new HuggingFaceService();
    
    // Get text embedding with Hugging Face service
    const embedding = await hfService.getTextEmbedding(goalText);
    
    if (!embedding) {
      return res.status(500).json({ error: 'Failed to generate embeddings for goal text' });
    }
    
    // Perform semantic search using the embedding
    let similarCSRs = [];
    
    if (searchType === 'semantic' || searchType === 'hybrid') {
      // Get all CSRs from database to use for semantic search
      const allReports = await db.select().from(csr_reports);
      const allDetails = await db.select().from(csr_details);
      
      // Match reports with details
      const csrsWithDetails = allReports.map(report => {
        const detail = allDetails.find(d => d.reportId === report.id);
        return { ...report, ...detail };
      });
      
      // Filter out reports without primary objectives
      const reportsWithObjectives = csrsWithDetails.filter(csr => 
        csr && csr.primaryObjective && csr.primaryObjective.length > 10
      );
      
      // For each CSR, calculate similarity with the goal text
      for (const csr of reportsWithObjectives) {
        // Combine primary and secondary objectives
        const csrGoalText = `${csr.primaryObjective || ''} ${csr.secondaryObjective || ''}`;
        
        // Get embedding for the CSR goal text
        const csrEmbedding = await hfService.getTextEmbedding(csrGoalText);
        
        if (csrEmbedding) {
          // Calculate cosine similarity between the goal text and CSR goal text
          const similarity = calculateCosineSimilarity(embedding, csrEmbedding);
          
          if (similarity >= minSimilarity) {
            // Process endpoints if available and requested
            const endpoints = [];
            if (includeEndpoints && csr.primaryEndpoint) {
              endpoints.push(csr.primaryEndpoint);
            }
            
            if (includeEndpoints && csr.secondaryEndpoints) {
              const secondaryEndpoints = typeof csr.secondaryEndpoints === 'string' 
                ? csr.secondaryEndpoints.split(',').map(e => e.trim())
                : Array.isArray(csr.secondaryEndpoints) ? csr.secondaryEndpoints : [];
              
              endpoints.push(...secondaryEndpoints);
            }
            
            // Add to similar CSRs
            similarCSRs.push({
              id: csr.id,
              title: csr.title,
              sponsor: csr.sponsor,
              indication: csr.indication,
              phase: csr.phase,
              sampleSize: includeSampleSize ? parseInt(csr.sampleSize) || null : null,
              primaryObjective: csr.primaryObjective || '',
              secondaryObjectives: csr.secondaryObjective || '',
              endpoints: endpoints.filter(e => e && e.length > 0),
              adverseEvents: includeAdverseEvents && csr.adverseEvents ? csr.adverseEvents : [],
              similarityScore: similarity
            });
          }
        }
      }
    }
    
    // For keyword search or hybrid search, also perform text-based search
    if (searchType === 'keyword' || searchType === 'hybrid') {
      // Get reports that match keywords in goal text
      const keywords = extractKeywords(goalText);
      
      if (keywords.length > 0) {
        for (const keyword of keywords) {
          if (keyword.length < 3) continue; // Skip short keywords
          
          const keywordResults = await db.select()
            .from(csr_reports)
            .leftJoin(csr_details, eq(csr_reports.id, csr_details.reportId))
            .where(
              and(
                or(
                  like(csr_reports.title, `%${keyword}%`),
                  like(csr_details.primaryObjective || '', `%${keyword}%`),
                  like(csr_details.secondaryObjective || '', `%${keyword}%`)
                )
              )
            );
          
          for (const result of keywordResults) {
            const report = result.csr_reports;
            const detail = result.csr_details;
            
            // Skip if already in similar CSRs
            if (similarCSRs.some(csr => csr.id === report.id)) {
              continue;
            }
            
            // Calculate keyword match score (simple heuristic)
            let keywordMatchScore = 0;
            keywords.forEach(kw => {
              if ((report.title || '').toLowerCase().includes(kw.toLowerCase())) keywordMatchScore += 0.2;
              if ((detail?.primaryObjective || '').toLowerCase().includes(kw.toLowerCase())) keywordMatchScore += 0.3;
              if ((detail?.secondaryObjective || '').toLowerCase().includes(kw.toLowerCase())) keywordMatchScore += 0.2;
            });
            
            // Normalize score
            keywordMatchScore = Math.min(keywordMatchScore, 0.95);
            
            // Only include if meets minimum similarity
            if (keywordMatchScore >= minSimilarity) {
              // Process endpoints if available and requested
              const endpoints = [];
              if (includeEndpoints && detail?.primaryEndpoint) {
                endpoints.push(detail.primaryEndpoint);
              }
              
              if (includeEndpoints && detail?.secondaryEndpoints) {
                const secondaryEndpoints = typeof detail.secondaryEndpoints === 'string' 
                  ? detail.secondaryEndpoints.split(',').map(e => e.trim())
                  : Array.isArray(detail.secondaryEndpoints) ? detail.secondaryEndpoints : [];
                
                endpoints.push(...secondaryEndpoints);
              }
              
              // Add to similar CSRs
              similarCSRs.push({
                id: report.id,
                title: report.title,
                sponsor: report.sponsor,
                indication: report.indication,
                phase: report.phase,
                sampleSize: includeSampleSize ? parseInt(detail?.sampleSize) || null : null,
                primaryObjective: detail?.primaryObjective || '',
                secondaryObjectives: detail?.secondaryObjective || '',
                endpoints: endpoints.filter(e => e && e.length > 0),
                adverseEvents: includeAdverseEvents && detail?.adverseEvents ? detail.adverseEvents : [],
                similarityScore: keywordMatchScore
              });
            }
          }
        }
      }
    }
    
    // Sort by similarity score and limit results
    similarCSRs.sort((a, b) => b.similarityScore - a.similarityScore);
    similarCSRs = similarCSRs.slice(0, maxResults);
    
    return res.json({ results: similarCSRs });
  } catch (error) {
    console.error('Error finding similar goals:', error);
    return res.status(500).json({ error: 'Failed to find similar studies' });
  }
}

/**
 * Query a specific study with AI using Hugging Face
 */
export async function queryStudyWithAI(req, res) {
  try {
    const { studyId, userGoal, conversation } = req.body;
    
    if (!studyId || !conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Study ID and conversation are required' });
    }
    
    // Get study details from database
    const study = await db.select()
      .from(csr_reports)
      .where(eq(csr_reports.id, studyId))
      .leftJoin(csr_details, eq(csr_reports.id, csr_details.reportId));
    
    if (!study || study.length === 0) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    const studyData = {
      ...study[0].csr_reports,
      ...study[0].csr_details
    };
    
    // Format context for the AI
    const context = `
You are an AI assistant specializing in clinical study reports (CSR) analysis for TrialSage.
You're analyzing a specific CSR with the following details:

Title: ${studyData.title}
Sponsor: ${studyData.sponsor}
Indication: ${studyData.indication}
Phase: ${studyData.phase}
${studyData.sampleSize ? `Sample Size: ${studyData.sampleSize}` : ''}

Primary Objective: ${studyData.primaryObjective || 'Not specified'}
${studyData.secondaryObjective ? `Secondary Objectives: ${studyData.secondaryObjective}` : ''}
${studyData.primaryEndpoint ? `Primary Endpoint: ${studyData.primaryEndpoint}` : ''}
${studyData.studyDesign ? `Study Design: ${studyData.studyDesign}` : ''}
${studyData.populationDescription ? `Population: ${studyData.populationDescription}` : ''}

The user's research goal is: "${userGoal}"

Analyze how this study relates to the user's goal. Be specific, concise, and provide actionable insights.
Focus on clinical relevance and practical applications. If you're unsure or information is missing, be transparent.

The user is a biomedical researcher or pharmaceutical professional seeking to understand this CSR in relation to their study goals.
Answer questions only about this specific study and its comparison to the user's goal.
`;

    const hfService = new HuggingFaceService();
    
    // Process and filter conversation for AI
    const filteredConversation = conversation.filter(msg => msg.role !== 'system');
    
    // Add system context as the first message
    const processedConversation = [
      { role: 'system', content: context },
      ...filteredConversation
    ];
    
    // Get response from Hugging Face
    const response = await hfService.generateStudyAnalysis(processedConversation);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate analysis' });
    }
    
    return res.json({ response });
  } catch (error) {
    console.error('Error querying study with AI:', error);
    return res.status(500).json({ error: 'Failed to analyze study' });
  }
}

/**
 * Helper function to calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Helper function to extract keywords from text
 */
function extractKeywords(text) {
  // Simple keyword extraction - remove common words and punctuation
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'for',
    'with', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over',
    'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around',
    'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
    'may', 'might', 'must', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'what', 'who', 'which', 'whose', 'whom', 'where', 'when', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'study', 'clinical', 'trial', 'research', 'patient', 'patients', 'objective',
    'objectives', 'goal', 'goals'
  ];
  
  // Normalize text and extract words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Return unique words
  return [...new Set(words)];
}

// Helper function for OR in drizzle-orm
function or(...conditions) {
  // Simple implementation of OR for Drizzle ORM
  return {
    type: 'or',
    conditions
  };
}

export default {
  findSimilarGoalsByText,
  queryStudyWithAI
};