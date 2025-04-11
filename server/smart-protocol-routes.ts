import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

export function registerSmartProtocolRoutes(app: any) {
  // CSR Benchmark API Endpoints
  app.get('/api/csr/benchmark', async (req: Request, res: Response) => {
    try {
      const { indication, phase } = req.query;
      
      if (!indication || !phase) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters: indication and phase' 
        });
      }
      
      // Call the Python function using spawn
      const python = spawn('python3', [
        path.join(process.cwd(), 'server/csr_benchmark_api.py'),
        '--action', 'get_metrics',
        '--indication', indication.toString(),
        '--phase', phase.toString()
      ]);
      
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to get CSR benchmark metrics' 
          });
        }
        
        try {
          const metricsData = JSON.parse(dataString);
          res.json(metricsData);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error parsing metrics data' 
          });
        }
      });
    } catch (error) {
      console.error('CSR benchmark error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  // Smart Protocol Draft endpoint
  app.post('/api/protocol/smart-draft', async (req: Request, res: Response) => {
    try {
      const { indication, phase, top_endpoints, sample_size, dropout } = req.body;
      
      if (!indication || !phase) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters: indication and phase' 
        });
      }
      
      // Call the Python function using spawn
      const python = spawn('python3', [
        path.join(process.cwd(), 'server/csr_benchmark_api.py'),
        '--action', 'generate_smart_protocol',
        '--indication', indication.toString(),
        '--phase', phase.toString(),
        '--top_endpoints', JSON.stringify(top_endpoints || []),
        '--sample_size', (sample_size || 0).toString(),
        '--dropout', (dropout || 0).toString()
      ]);
      
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate smart protocol draft' 
          });
        }
        
        try {
          const draftData = JSON.parse(dataString);
          res.json(draftData);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error parsing protocol draft data' 
          });
        }
      });
    } catch (error) {
      console.error('Smart protocol draft error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  // Protocol Draft PDF Export
  app.post('/api/protocol/export-smart-pdf', async (req: Request, res: Response) => {
    try {
      const { protocol_text, protocol_id = "Smart_Draft" } = req.body;
      
      if (!protocol_text) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameter: protocol_text' 
        });
      }
      
      const timestamp = Date.now();
      const filename = `TrialSage_Protocol_Draft_${timestamp}.pdf`;
      const outputPath = path.join(process.cwd(), 'data/exports', filename);
      
      // Create the PDF using Python's FPDF
      const python = spawn('python3', ['-c', `
from fpdf import FPDF
import sys
import json

try:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, f"TrialSage Smart Protocol Draft – ${protocol_id}", ln=True, align="C")
    pdf.ln(5)

    pdf.set_font("Arial", "", 11)
    protocol_text = """${protocol_text.replace(/"/g, '\\"')}"""
    for line in protocol_text.split('\\n'):
        pdf.multi_cell(0, 8, line)

    pdf.output("${outputPath}")
    print(json.dumps({"success": True}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
      `]);
      
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate PDF' 
          });
        }
        
        try {
          const result = JSON.parse(dataString);
          if (!result.success) {
            return res.status(500).json({
              success: false,
              message: `PDF generation failed: ${result.error}`
            });
          }
          
          res.json({
            success: true,
            download_url: `/download/${filename}`
          });
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error processing PDF generation result' 
          });
        }
      });
    } catch (error) {
      console.error('Protocol PDF export error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  // Export Full Bundle (Protocol + Strategic + SAP)
  app.post('/api/export/full-bundle', async (req: Request, res: Response) => {
    try {
      const { 
        indication, 
        phase, 
        protocol_draft, 
        strategic_summary, 
        sap_section 
      } = req.body;
      
      if (!indication || !phase || !protocol_draft || !strategic_summary || !sap_section) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters for bundle export' 
        });
      }
      
      // Call the Python function using spawn
      const python = spawn('python3', [
        path.join(process.cwd(), 'server/csr_benchmark_api.py'),
        '--action', 'generate_bundle',
        '--indication', indication.toString(),
        '--phase', phase.toString(),
        '--protocol_draft', protocol_draft.toString(),
        '--strategic_summary', strategic_summary.toString(),
        '--sap_section', sap_section.toString()
      ]);
      
      let dataString = '';
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      python.on('close', (code) => {
        if (code !== 0) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate bundle export' 
          });
        }
        
        try {
          const bundleData = JSON.parse(dataString);
          res.json({
            success: true,
            ...bundleData
          });
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error parsing bundle export result' 
          });
        }
      });
    } catch (error) {
      console.error('Bundle export error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
}