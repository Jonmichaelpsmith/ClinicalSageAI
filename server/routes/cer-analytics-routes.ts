/**
 * CER Analytics Routes
 * 
 * This module provides API endpoints for advanced analytics on Clinical Evaluation Reports,
 * including comparative analysis, forecasting, and NLP-powered queries.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { clinicalEvaluationReports } from '../../shared/schema';
import { eq, like, and } from 'drizzle-orm';
import { requireOpenAIKey } from '../check-secrets';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI();
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

/**
 * Endpoint to compare data across multiple NDC codes
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { ndc_codes } = req.body;
    
    if (!ndc_codes || !Array.isArray(ndc_codes) || ndc_codes.length === 0) {
      return res.status(400).json({ error: 'ndc_codes array is required' });
    }
    
    // Process each NDC code to gather comparative data
    const comparative_data: any = {};
    
    for (const ndc_code of ndc_codes) {
      // Retrieve CER reports for this NDC code
      const reports = await db
        .select()
        .from(clinicalEvaluationReports)
        .where(like(clinicalEvaluationReports.content_text, `%${ndc_code}%`));
      
      if (reports.length > 0) {
        // Process report content to extract event summaries
        // This is a simplified example - in a real implementation, this would parse the structured content
        const eventSummary = extractEventSummary(reports);
        const forecasts = generateForecasts(eventSummary);
        
        comparative_data[ndc_code] = {
          report_count: reports.length,
          event_summary: eventSummary,
          forecasts: forecasts
        };
      } else {
        // If no real data, provide minimal placeholder for UI development
        comparative_data[ndc_code] = {
          report_count: 0,
          event_summary: {
            'No Data': 0
          },
          forecasts: {}
        };
      }
    }
    
    res.json({ comparative_data });
  } catch (error) {
    console.error('Error in comparative analytics:', error);
    res.status(500).json({ error: 'Error processing comparative analytics' });
  }
});

/**
 * Endpoint for processing natural language queries
 * Uses OpenAI to interpret and translate natural language to structured queries
 */
router.post('/nlp-query', requireOpenAIKey(), async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }
    
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI client not available' });
    }
    
    // Process the query with OpenAI to extract parameters and intent
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping extract structured query parameters from natural language queries 
                   about Clinical Evaluation Reports and FAERS data. Extract key parameters like:
                   - product/device names or NDC codes
                   - demographic filters (age, gender)
                   - adverse event types
                   - date ranges
                   - comparison requests
                   - trend analysis requests
                   Output JSON with these parameters and a 'query_type' field.`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the structured query parameters
    const structuredQuery = JSON.parse(completion.choices[0].message.content);
    
    // Execute the structured query against the database
    // This is a simplified implementation
    const results = await executeStructuredQuery(structuredQuery);
    
    res.json({
      query: query,
      structured_parameters: structuredQuery,
      filtered: true,
      results: results,
      message: `Applied filter: ${query}`,
      count: results.length
    });
  } catch (error) {
    console.error('Error in NLP query processing:', error);
    res.status(500).json({ 
      error: 'Error processing natural language query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Extract event summary from CER reports
 * This is a simplified example - real implementation would parse structured content
 */
function extractEventSummary(reports: any[]): Record<string, number> {
  const eventSummary: Record<string, number> = {};
  
  // Common adverse events to extract
  const commonEvents = [
    'Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Rash',
    'Vomiting', 'Diarrhea', 'Pain', 'Fever', 'Insomnia'
  ];
  
  // Count mentions of common events in report content
  for (const report of reports) {
    const content = report.content_text || '';
    
    for (const event of commonEvents) {
      const regex = new RegExp(event, 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        eventSummary[event] = (eventSummary[event] || 0) + count;
      }
    }
  }
  
  // If no events found, provide minimal data
  if (Object.keys(eventSummary).length === 0) {
    eventSummary['No specific events found'] = 0;
  }
  
  return eventSummary;
}

/**
 * Generate simple forecasts based on event summary
 * This is a simplified example - real implementation would use statistical models
 */
function generateForecasts(eventSummary: Record<string, number>): Record<string, Record<string, number>> {
  const forecasts: Record<string, Record<string, number>> = {};
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  
  Object.keys(eventSummary).forEach(event => {
    if (event === 'No specific events found') return;
    
    const baseCount = eventSummary[event];
    forecasts[event] = {};
    
    // Simple model: slight decrease over time
    quarters.forEach((quarter, index) => {
      const reduction = 0.02 * (index + 1);
      forecasts[event][quarter] = Math.max(1, Math.round(baseCount * (1 - reduction)));
    });
  });
  
  return forecasts;
}

/**
 * Execute a structured query against the database
 * This is a simplified implementation
 */
async function executeStructuredQuery(structuredQuery: any): Promise<any[]> {
  try {
    // Extract parameters from the structured query
    const productName = structuredQuery.product || structuredQuery.device || null;
    const ageFilter = structuredQuery.age || null;
    const eventType = structuredQuery.event || structuredQuery.adverse_event || null;
    
    // Build a basic query - in a real implementation, this would be more sophisticated
    let query = db.select().from(clinicalEvaluationReports);
    
    if (productName) {
      query = query.where(like(clinicalEvaluationReports.device_name, `%${productName}%`));
    }
    
    if (eventType) {
      query = query.where(like(clinicalEvaluationReports.content_text, `%${eventType}%`));
    }
    
    // Execute the query
    const results = await query.limit(10);
    
    // Apply additional filters that can't be done at the database level
    // In a real implementation, this would be more sophisticated
    let filteredResults = results;
    
    if (ageFilter) {
      // Simplified age filtering by looking for content mentions
      filteredResults = filteredResults.filter(report => 
        report.content_text.includes(ageFilter) || 
        report.content_text.toLowerCase().includes(`age ${ageFilter}`)
      );
    }
    
    return filteredResults;
  } catch (error) {
    console.error('Error executing structured query:', error);
    return [];
  }
}

export default router;