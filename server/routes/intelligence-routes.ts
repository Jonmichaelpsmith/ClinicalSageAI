import { Router, Request, Response } from 'express';
import { createAssistantThread, runAssistant, getRunOutput, embedText } from '../services/openai-service';
import { db } from '../db';
import { csr_reports, csr_details } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Generate an AI summary of a CSR
 * Replaces the old /api/csrs/summary endpoint
 */
router.post('/api/intel/summary', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.body;
    if (!reportId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report ID is required' 
      });
    }

    // Get the report data
    const report = await db.query.csr_reports.findFirst({
      where: eq(csr_reports.id, reportId)
    });

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    // Get the details
    const details = await db.query.csr_details.findFirst({
      where: eq(csr_details.reportId, reportId)
    });

    // Create a thread
    const threadId = await createAssistantThread();

    // Create a prompt for the assistant
    const prompt = `Generate a comprehensive summary of the following clinical study report:

Title: ${report.title}
Indication: ${report.indication}
Phase: ${report.phase}
Sponsor: ${report.sponsor}
Status: ${report.status}

Key details:
${details ? `
- Study Design: ${details.studyDesign}
- Primary Objective: ${details.primaryObjective}
- Primary Endpoint: ${details.primaryEndpoint}
- Secondary Objective: ${details.secondaryObjective}
- Study Population: ${details.studyPopulation}
- Sample Size: ${details.sampleSize}
- Treatment Duration: ${details.treatmentDuration}
` : 'No detailed information available'}

I need a well-structured summary that includes:
1. Study Overview (design, objectives, population)
2. Key Endpoints and Assessment Methods
3. Efficacy Results
4. Safety Findings
5. Limitations and Conclusions

Format the response with markdown headings and bullet points for clarity.`;

    // Run the assistant
    const runId = await runAssistant(threadId, prompt);
    
    // Get the output
    const output = await getRunOutput(threadId, runId);

    // Return the response
    return res.json({
      success: true,
      summary: output,
      reportId,
      title: report.title,
      indication: report.indication,
      phase: report.phase
    });
  } catch (error) {
    console.error('Error generating CSR summary:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

/**
 * Compare two CSRs to identify similarities and differences
 * Replaces the old /api/csrs/compare-deltas endpoint
 */
router.post('/api/intel/compare', async (req: Request, res: Response) => {
  try {
    const { reportIdA, reportIdB } = req.body;
    
    if (!reportIdA || !reportIdB) {
      return res.status(400).json({
        success: false,
        message: 'Two report IDs are required'
      });
    }

    // Get both reports
    const [reportA, reportB] = await Promise.all([
      db.query.csr_reports.findFirst({
        where: eq(csr_reports.id, reportIdA)
      }),
      db.query.csr_reports.findFirst({
        where: eq(csr_reports.id, reportIdB)
      })
    ]);

    if (!reportA || !reportB) {
      return res.status(404).json({
        success: false,
        message: 'One or both reports not found'
      });
    }

    // Get details for both reports
    const [detailsA, detailsB] = await Promise.all([
      db.query.csr_details.findFirst({
        where: eq(csr_details.reportId, reportIdA)
      }),
      db.query.csr_details.findFirst({
        where: eq(csr_details.reportId, reportIdB)
      })
    ]);

    // Create a thread
    const threadId = await createAssistantThread();

    // Create a prompt for the assistant
    const prompt = `Compare the following two clinical study reports and identify key similarities and differences:

REPORT A:
Title: ${reportA.title}
Indication: ${reportA.indication}
Phase: ${reportA.phase}
Sponsor: ${reportA.sponsor}
Key details:
${detailsA ? `
- Study Design: ${detailsA.studyDesign}
- Primary Endpoint: ${detailsA.primaryEndpoint}
- Sample Size: ${detailsA.sampleSize}
- Treatment Duration: ${detailsA.treatmentDuration}
` : 'No detailed information available'}

REPORT B:
Title: ${reportB.title}
Indication: ${reportB.indication}
Phase: ${reportB.phase}
Sponsor: ${reportB.sponsor}
Key details:
${detailsB ? `
- Study Design: ${detailsB.studyDesign}
- Primary Endpoint: ${detailsB.primaryEndpoint}
- Sample Size: ${detailsB.sampleSize}
- Treatment Duration: ${detailsB.treatmentDuration}
` : 'No detailed information available'}

Please provide a structured comparison with the following sections:
1. Overview of similarities and differences
2. Key design elements comparison
3. Endpoint comparison
4. Population differences
5. Critical insights from the comparison

Format the response with markdown headings and use tables where appropriate to enhance readability.`;

    // Run the assistant
    const runId = await runAssistant(threadId, prompt);
    
    // Get the output
    const output = await getRunOutput(threadId, runId);

    // Return the response
    return res.json({
      success: true,
      comparison: output,
      reportA: {
        id: reportA.id,
        title: reportA.title,
        indication: reportA.indication,
        phase: reportA.phase
      },
      reportB: {
        id: reportB.id,
        title: reportB.title,
        indication: reportB.indication,
        phase: reportB.phase
      }
    });
  } catch (error) {
    console.error('Error comparing CSRs:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

/**
 * Generate a strategic intelligence brief for a specific indication
 * New endpoint
 */
router.post('/api/intel/brief', async (req: Request, res: Response) => {
  try {
    const { indication, focusAreas = ['endpoints', 'study_design'] } = req.body;
    
    if (!indication) {
      return res.status(400).json({
        success: false,
        message: 'Indication is required'
      });
    }

    // Get reports for this indication
    const reports = await db.query.csr_reports.findMany({
      where: eq(csr_reports.indication, indication),
      limit: 10 // Limit to avoid overwhelming the API
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reports found for this indication'
      });
    }

    // Create a thread
    const threadId = await createAssistantThread();

    // Prepare a summary of the available reports
    const reportsSummary = reports.map(r => 
      `- ${r.title} (Phase ${r.phase}, ${r.sponsor})`
    ).join('\n');

    // Create a prompt for the assistant
    const prompt = `Generate a strategic intelligence brief for ${indication} based on the following clinical study reports:

${reportsSummary}

Focus areas: ${focusAreas.join(', ')}

Please provide a comprehensive analysis with the following sections:
1. Executive Summary
2. Key Trial Design Patterns
3. Endpoint Selection Analysis
4. Population and Inclusion/Exclusion Criteria Trends
5. Statistical Approach Patterns
6. Success and Failure Analysis
7. Regulatory Considerations
8. Strategic Recommendations

Format the response with markdown headings and use tables or bullet points where appropriate to enhance readability.`;

    // Run the assistant
    const runId = await runAssistant(threadId, prompt);
    
    // Get the output
    const output = await getRunOutput(threadId, runId);

    // Return the response
    return res.json({
      success: true,
      brief: output,
      indication,
      focusAreas,
      reportCount: reports.length
    });
  } catch (error) {
    console.error('Error generating intelligence brief:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

/**
 * Generate IND module sections using OpenAI
 * New endpoint
 */
router.post('/api/intel/ind-module', async (req: Request, res: Response) => {
  try {
    const { 
      indication, 
      phase, 
      drugName, 
      moduleType, // 2.5 (clinical overview) or 2.7 (clinical summary)
      sections = ['all'] 
    } = req.body;
    
    if (!indication || !phase || !drugName || !moduleType) {
      return res.status(400).json({
        success: false,
        message: 'Indication, phase, drug name, and module type are required'
      });
    }

    // Get reports for this indication and phase
    const reports = await db.query.csr_reports.findMany({
      where: eq(csr_reports.indication, indication),
      limit: 5 // Limit to avoid overwhelming the API
    });

    // Create a thread
    const threadId = await createAssistantThread();

    // Create a prompt for the assistant
    const prompt = `Generate IND module ${moduleType} (${moduleType === '2.5' ? 'Clinical Overview' : 'Clinical Summary'}) sections for ${drugName} in ${indication} Phase ${phase}.

${reports.length > 0 ? `Based on the following similar trials:
${reports.map(r => `- ${r.title} (${r.sponsor})`).join('\n')}` : 'No similar trials found in the database, so please use your general knowledge of this indication.'}

Please generate content for the following sections: ${sections.join(', ')}

The content should follow regulatory requirements and be structured appropriately for an IND submission. Include placeholders for data that would need to be filled in with actual clinical data.

Format the response with markdown headings and subheadings to match IND module structure.`;

    // Run the assistant
    const runId = await runAssistant(threadId, prompt);
    
    // Get the output
    const output = await getRunOutput(threadId, runId);

    // Return the response
    return res.json({
      success: true,
      indModule: output,
      indication,
      phase,
      drugName,
      moduleType,
      sections
    });
  } catch (error) {
    console.error('Error generating IND module:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

/**
 * Protocol Q&A endpoint
 * New endpoint 
 */
router.post('/api/intel/protocol-qa', async (req: Request, res: Response) => {
  try {
    const { question, indication, phase, context } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Create a thread
    const threadId = await createAssistantThread();

    // Create a prompt for the assistant
    let prompt = `Answer the following clinical protocol design question: "${question}"`;
    
    if (indication) {
      prompt += `\n\nIndication context: ${indication}`;
    }
    
    if (phase) {
      prompt += `\nPhase: ${phase}`;
    }
    
    if (context) {
      prompt += `\n\nAdditional context: ${context}`;
    }

    prompt += `\n\nPlease provide a comprehensive, evidence-based answer using your knowledge of clinical trial protocols, regulatory requirements, and best practices. Cite specific guidance documents or precedents where applicable.`;

    // Run the assistant
    const runId = await runAssistant(threadId, prompt);
    
    // Get the output
    const output = await getRunOutput(threadId, runId);

    // Return the response
    return res.json({
      success: true,
      answer: output,
      question
    });
  } catch (error) {
    console.error('Error answering protocol question:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

export default router;