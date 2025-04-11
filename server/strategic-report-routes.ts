import express from 'express';
import { db } from './db';
import { strategicReports, protocols } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { strategicReportGenerator } from './strategic-report-generator';

const router = express.Router();

/**
 * Get all strategic reports
 */
router.get('/api/strategic-reports', async (req, res) => {
  try {
    const allReports = await db.select().from(strategicReports).orderBy(strategicReports.generatedDate);
    res.json(allReports);
  } catch (error) {
    console.error('Error fetching strategic reports:', error);
    res.status(500).json({ error: 'Failed to fetch strategic reports' });
  }
});

/**
 * Get a specific strategic report by ID
 */
router.get('/api/strategic-reports/:id', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }
    
    const [report] = await db.select().from(strategicReports).where(eq(strategicReports.id, reportId));
    
    if (!report) {
      return res.status(404).json({ error: 'Strategic report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(`Error fetching strategic report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch strategic report' });
  }
});

/**
 * Generate a strategic report for a protocol
 */
router.post('/api/strategic-reports/generate', async (req, res) => {
  try {
    const { protocolId } = req.body;
    
    if (!protocolId) {
      return res.status(400).json({ error: 'Protocol ID is required' });
    }
    
    // Get protocol data
    const [protocol] = await db.select().from(protocols).where(eq(protocols.id, protocolId));
    
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    
    // Check if report already exists
    const [existingReport] = await db
      .select()
      .from(strategicReports)
      .where(eq(strategicReports.protocolId, protocolId));
    
    if (existingReport) {
      return res.json({ 
        reportId: existingReport.id,
        message: 'Strategic report already exists for this protocol',
        isNew: false
      });
    }
    
    // Extract needed data from protocol
    const primaryEndpoints = protocol.primaryEndpoints 
      ? (typeof protocol.primaryEndpoints === 'string' 
        ? [protocol.primaryEndpoints] 
        : protocol.primaryEndpoints) 
      : [];
      
    // Generate the report
    const reportId = await strategicReportGenerator.generateReport(
      protocol.id,
      protocol.indication || '',
      protocol.phase || '',
      primaryEndpoints,
      protocol.sampleSize || 0,
      protocol.durationWeeks || 0,
      protocol.controlType || '',
      protocol.blinding || ''
    );
    
    res.json({ 
      reportId,
      message: 'Strategic report generated successfully',
      isNew: true
    });
    
  } catch (error) {
    console.error('Error generating strategic report:', error);
    res.status(500).json({ error: 'Failed to generate strategic report' });
  }
});

/**
 * Generate or regenerate a strategic report on demand
 */
router.post('/api/strategic-reports/generate-custom', async (req, res) => {
  try {
    const { 
      protocolId,
      indication, 
      phase, 
      primaryEndpoints, 
      sampleSize, 
      duration, 
      controlType, 
      blinding 
    } = req.body;
    
    if (!indication || !phase) {
      return res.status(400).json({ error: 'Indication and phase are required' });
    }
    
    // Generate the report
    const reportId = await strategicReportGenerator.generateReport(
      protocolId || 0,
      indication,
      phase,
      primaryEndpoints || [],
      sampleSize || 0,
      duration || 0,
      controlType || '',
      blinding || ''
    );
    
    res.json({ 
      reportId,
      message: 'Custom strategic report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating custom strategic report:', error);
    res.status(500).json({ error: 'Failed to generate custom strategic report' });
  }
});

/**
 * Delete a strategic report
 */
router.delete('/api/strategic-reports/:id', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }
    
    // Check if report exists
    const [report] = await db
      .select()
      .from(strategicReports)
      .where(eq(strategicReports.id, reportId));
    
    if (!report) {
      return res.status(404).json({ error: 'Strategic report not found' });
    }
    
    // Delete the report
    await db.delete(strategicReports).where(eq(strategicReports.id, reportId));
    
    res.json({ message: 'Strategic report deleted successfully' });
  } catch (error) {
    console.error(`Error deleting strategic report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete strategic report' });
  }
});

export default router;