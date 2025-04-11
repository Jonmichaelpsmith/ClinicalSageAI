import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { generateSAP } from '../utils/generate_sap_snippet';

const router = Router();
const dossiersDir = path.join(process.cwd(), 'data/dossiers');

// Ensure dossiers directory exists
if (!fs.existsSync(dossiersDir)) {
  fs.mkdirSync(dossiersDir, { recursive: true });
}

// Create temp directory for report generation
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Save intelligence report with version tracking and changelog
 * This endpoint handles:
 * - Automatic version labeling (v1, v2, v3...)
 * - Field-level changelog generation
 * - Human-readable summary of changes
 * - Success prediction tracking (before/after)
 * - Statistical Analysis Plan (SAP) generation
 */
router.post('/save-intelligence-report', async (req: Request, res: Response) => {
  try {
    const { protocol_id, user_id, report_data, optimized } = req.body;
    
    if (!protocol_id || !user_id || !report_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create path for this user/protocol dossier
    const dossierPath = path.join(dossiersDir, `${user_id}_${protocol_id}_dossier.json`);
    const timestamp = new Date().toISOString();
    
    // Load existing dossier or initialize a new one
    let dossier;
    if (fs.existsSync(dossierPath)) {
      dossier = JSON.parse(fs.readFileSync(dossierPath, 'utf8'));
    } else {
      dossier = {
        protocol_id,
        user_id,
        created_at: timestamp,
        reports: []
      };
    }
    
    // Generate version number
    const versionNumber = dossier.reports.length + 1;
    const versionId = `v${versionNumber}`;
    
    // Generate changelog by comparing with previous version
    const changelog: string[] = [];
    const summary: string[] = [];
    let previousPrediction = null;
    let statisticalImplications: string[] = [];
    
    // Generate SAP based on protocol data if available
    if (report_data.parsed) {
      report_data.sap = generateSAP(report_data.parsed);
    }
    
    if (dossier.reports.length > 0) {
      const previousVersion = dossier.reports[dossier.reports.length - 1];
      const previousData = previousVersion.original?.parsed || {};
      const currentData = report_data.parsed || {};
      
      // Import utility for detecting statistical implications
      const { detectStatisticalImplications } = await import('../utils/generate_sap_snippet');
      statisticalImplications = detectStatisticalImplications(previousData, currentData);
      
      // Track key field changes
      const fieldMap: Record<string, string> = {
        'sample_size': 'Sample Size',
        'duration_weeks': 'Duration (weeks)',
        'dropout_rate': 'Dropout Rate',
        'endpoint_primary': 'Primary Endpoint',
        'phase': 'Phase',
        'randomization': 'Randomization',
        'blinding': 'Blinding'
      };
      
      // Generate changelog entries for each changed field
      Object.entries(fieldMap).forEach(([field, label]) => {
        const oldValue = previousData[field];
        const newValue = currentData[field];
        
        if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
          if (field === 'dropout_rate') {
            // Format dropout rate as percentage
            const oldPercent = (parseFloat(oldValue) * 100).toFixed(1) + '%';
            const newPercent = (parseFloat(newValue) * 100).toFixed(1) + '%';
            changelog.push(`${label}: ${oldPercent} → ${newPercent}`);
            summary.push(`changed dropout rate to ${newPercent}`);
          } else {
            changelog.push(`${label}: ${oldValue} → ${newValue}`);
            
            // Add to human-readable summary
            if (field === 'sample_size') {
              const diff = parseInt(newValue) - parseInt(oldValue);
              const direction = diff > 0 ? 'increased' : 'decreased';
              summary.push(`${direction} sample size by ${Math.abs(diff)}`);
            } else if (field === 'duration_weeks') {
              const diff = parseInt(newValue) - parseInt(oldValue);
              const direction = diff > 0 ? 'extended' : 'reduced';
              summary.push(`${direction} duration by ${Math.abs(diff)} weeks`);
            } else if (field === 'endpoint_primary') {
              summary.push(`updated primary endpoint`);
            } else {
              summary.push(`updated ${field.replace('_', ' ')}`);
            }
          }
        }
      });
      
      // Track prediction change
      if (previousVersion.original?.prediction !== undefined && 
          report_data.prediction !== undefined) {
        previousPrediction = previousVersion.original.prediction;
        const oldPrediction = (previousPrediction * 100).toFixed(1) + '%';
        const newPrediction = (report_data.prediction * 100).toFixed(1) + '%';
        
        if (previousPrediction !== report_data.prediction) {
          changelog.push(`Success Prediction: ${oldPrediction} → ${newPrediction}`);
          
          const diff = (report_data.prediction - previousPrediction) * 100;
          if (diff > 0) {
            summary.push(`improved success prediction by ${diff.toFixed(1)}%`);
          } else {
            summary.push(`decreased success prediction by ${Math.abs(diff).toFixed(1)}%`);
          }
        }
      }
    } else {
      // First version
      changelog.push("Initial protocol version");
      summary.push("Initial protocol created");
      
      // Add protocol details to changelog for initial version
      const protocolData = report_data.parsed || {};
      
      if (protocolData.indication) {
        changelog.push(`Indication: ${protocolData.indication}`);
      }
      
      if (protocolData.phase) {
        changelog.push(`Phase: ${protocolData.phase}`);
      }
      
      if (protocolData.sample_size) {
        changelog.push(`Sample Size: ${protocolData.sample_size}`);
      }
      
      if (protocolData.duration_weeks) {
        changelog.push(`Duration: ${protocolData.duration_weeks} weeks`);
      }
      
      if (protocolData.endpoint_primary) {
        changelog.push(`Primary Endpoint: ${protocolData.endpoint_primary}`);
      }
      
      if (report_data.prediction !== undefined) {
        const prediction = (report_data.prediction * 100).toFixed(1) + '%';
        changelog.push(`Initial Success Prediction: ${prediction}`);
      }
    }
    
    // If no changes were detected, add a default message
    if (changelog.length === 0) {
      changelog.push("No significant changes detected");
      summary.push("Updated protocol (no significant changes)");
    }
    
    // Create new versioned entry with changelog and SAP
    const entry = {
      created_at: timestamp,
      version: versionId,
      changelog: changelog,
      summary: summary.join(', '),
      statistical_implications: statisticalImplications,
      previous_prediction: previousPrediction,
      original: report_data,
      optimized: optimized || null
    };
    
    // Add entry to reports
    dossier.reports.push(entry);
    
    // Save updated dossier
    fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2));
    
    // Generate SAP PDF if there's SAP data and it's a new version or SAP changed
    let sapReportPath = null;
    if (report_data.sap) {
      // Write SAP to temp file for PDF generation
      const sapTextFile = path.join(tempDir, `sap_${protocol_id}_${versionId}.txt`);
      fs.writeFileSync(sapTextFile, report_data.sap);
      
      // Create protocol data file for context
      const protocolDataFile = path.join(tempDir, `protocol_${protocol_id}_${versionId}.json`);
      fs.writeFileSync(protocolDataFile, JSON.stringify(report_data.parsed || {}));
      
      // Generate SAP PDF using Python script
      const pythonProcess = spawn('python3', [
        'scripts/generate_sap_report.py',
        protocol_id,
        versionId,
        sapTextFile,
        protocolDataFile
      ]);
      
      let resultData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temp files
        try {
          fs.unlinkSync(sapTextFile);
          fs.unlinkSync(protocolDataFile);
        } catch (err) {
          console.error('Error cleaning up temp files:', err);
        }
        
        if (code === 0) {
          sapReportPath = resultData.trim();
          console.log(`SAP report generated: ${sapReportPath}`);
        }
      });
    }
    
    return res.status(200).json({
      message: 'Intelligence report saved with version tracking and changelog',
      version: versionId,
      protocol_id,
      user_id,
      changelog,
      summary: summary.join(', '),
      has_sap: !!report_data.sap,
      sap_report_path: sapReportPath
    });
  } catch (error) {
    console.error('Error saving intelligence report:', error);
    return res.status(500).json({ error: 'Failed to save intelligence report' });
  }
});

/**
 * Get intelligence report for a specific version
 */
router.get('/:user_id/:protocol_id/versions/:version_id', async (req: Request, res: Response) => {
  try {
    const { user_id, protocol_id, version_id } = req.params;
    
    // Validate parameters
    if (!user_id || !protocol_id || !version_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Create path for this user/protocol dossier
    const dossierPath = path.join(dossiersDir, `${user_id}_${protocol_id}_dossier.json`);
    
    // Check if dossier exists
    if (!fs.existsSync(dossierPath)) {
      return res.status(404).json({ error: 'Dossier not found' });
    }
    
    // Load dossier
    const dossier = JSON.parse(fs.readFileSync(dossierPath, 'utf8'));
    
    // Find the requested version
    const versionReport = dossier.reports.find((report: any) => report.version === version_id);
    
    if (!versionReport) {
      return res.status(404).json({ error: 'Version not found in dossier' });
    }
    
    return res.status(200).json(versionReport);
  } catch (error) {
    console.error('Error retrieving intelligence report version:', error);
    return res.status(500).json({ error: 'Failed to retrieve intelligence report version' });
  }
});

/**
 * Restore a previous version and generate a restoration report
 */
router.post('/:user_id/:protocol_id/restore/:version_id', async (req: Request, res: Response) => {
  try {
    const { user_id, protocol_id, version_id } = req.params;
    
    // Validate parameters
    if (!user_id || !protocol_id || !version_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Create path for this user/protocol dossier
    const dossierPath = path.join(dossiersDir, `${user_id}_${protocol_id}_dossier.json`);
    
    // Check if dossier exists
    if (!fs.existsSync(dossierPath)) {
      return res.status(404).json({ error: 'Dossier not found' });
    }
    
    // Load dossier
    const dossier = JSON.parse(fs.readFileSync(dossierPath, 'utf8'));
    
    // Find the requested version
    const versionReport = dossier.reports.find((report: any) => report.version === version_id);
    
    if (!versionReport) {
      return res.status(404).json({ error: 'Version not found in dossier' });
    }
    
    // Generate restoration report using Python script
    const restoredDataFile = path.join(tempDir, `restore_${protocol_id}_${version_id}.json`);
    fs.writeFileSync(restoredDataFile, JSON.stringify(versionReport.original));
    
    // Generate restore report
    const pythonProcess = spawn('python3', [
      'scripts/generate_restore_report.py',
      protocol_id,
      version_id,
      restoredDataFile
    ]);
    
    let resultData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`Restore report generation error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(restoredDataFile);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
      
      if (code !== 0) {
        console.error(`Restore report generation failed: ${errorData}`);
      }
    });
    
    // Create a new version entry with the restored data
    // This establishes the version history while maintaining the audit trail
    // First, create a new request to the save endpoint
    const saveRequest = {
      body: {
        protocol_id,
        user_id,
        report_data: versionReport.original,
        optimized: versionReport.optimized
      }
    } as Request;
    
    const saveResponse = {
      status: (code: number) => {
        return {
          json: (data: any) => {
            // Add restoration information to the response
            return res.status(code).json({
              ...data,
              restored_from: version_id,
              restoration_report: resultData.trim()
            });
          }
        };
      }
    } as Response;
    
    // Use the save endpoint to create a new version with the restored data
    await router.stack.find(layer => layer.route?.path === '/save-intelligence-report')?.route?.stack[0].handle(saveRequest, saveResponse);
    
  } catch (error) {
    console.error('Error restoring intelligence report version:', error);
    return res.status(500).json({ error: 'Failed to restore intelligence report version' });
  }
});

export default router;