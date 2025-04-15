/**
 * FDA FAERS Routes
 * 
 * This module provides API routes for interacting with the FDA FAERS API
 * and generating CER reports using OpenAI.
 */

import express from 'express';
import { exec } from 'child_process';
import util from 'util';
import { db } from '../db';
import { clinicalEvaluationReports } from './cer-routes';
import { v4 as uuidv4 } from 'uuid';
import { isApiKeyAvailable as isOpenAIApiKeyAvailable } from '../openai-service';
import fs from 'fs';
import path from 'path';
import { check_secrets } from '../check-secrets';

const router = express.Router();
const execPromise = util.promisify(exec);

// Middleware to check if OpenAI API key is available
router.use(async (req, res, next) => {
  try {
    // Check if OPENAI_API_KEY is in environment variables
    const secrets = await check_secrets(['OPENAI_API_KEY']);
    const hasOpenAIKey = secrets.OPENAI_API_KEY;
    
    if (!hasOpenAIKey) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'The OpenAI API key is required for CER generation but is not configured. Please contact your administrator.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking for OpenAI API key:', error);
    next();
  }
});

// Generate a CER from an NDC code using FAERS data
router.get('/:ndcCode', async (req, res) => {
  try {
    const { ndcCode } = req.params;
    const productName = req.query.product_name as string || '';
    
    console.log(`Generating CER for NDC code: ${ndcCode}`);
    
    // Create a temporary directory for Python script execution if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a temporary Python script file
    const scriptId = uuidv4().substring(0, 8);
    const tempScriptPath = path.join(tempDir, `faers_script_${scriptId}.py`);
    
    const scriptContent = `
import json
import sys
import os

# Ensure the OPENAI_API_KEY is set for the script
os.environ["OPENAI_API_KEY"] = "${process.env.OPENAI_API_KEY}"

try:
    sys.path.append("${process.cwd()}")
    from faers_client import get_faers_data
    from cer_narrative import generate_cer_narrative
    
    ndc_code = "${ndcCode}"
    product_name = ${productName ? `"${productName}"` : 'None'}
    
    # Fetch FAERS data for the NDC code
    faers_data = get_faers_data(ndc_code)
    
    # Generate the CER narrative
    cer_text = generate_cer_narrative(faers_data, product_name)
    
    # Return results as JSON
    result = {
        "cer_report": cer_text,
        "ndc_code": ndc_code,
        "product_name": product_name,
        "total_records": faers_data.get("meta", {}).get("results", {}).get("total", 0)
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;

    fs.writeFileSync(tempScriptPath, scriptContent);
    
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python ${tempScriptPath}`);
    
    // Clean up the temporary script file
    fs.unlinkSync(tempScriptPath);
    
    if (stderr) {
      console.error('Python Error:', stderr);
      return res.status(500).json({ error: 'Error generating CER report', details: stderr });
    }
    
    // Parse the JSON output from Python
    try {
      const result = JSON.parse(stdout);
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }
      
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing Python output:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse CER generation output',
        details: parseError.message 
      });
    }
  } catch (error) {
    console.error('Error generating CER report:', error);
    res.status(500).json({ 
      error: 'Failed to generate CER report',
      message: error.message
    });
  }
});

// Save a generated CER to the database
router.post('/save', async (req, res) => {
  try {
    const { 
      title, 
      device_name, 
      manufacturer, 
      content_text, 
      metadata 
    } = req.body;
    
    if (!content_text) {
      return res.status(400).json({ error: 'CER content is required' });
    }
    
    // Generate a unique CER ID
    const cerId = `CER-FAERS-${uuidv4().substring(0, 8)}`;
    
    // Prepare data for insertion
    const cerData = {
      cer_id: cerId,
      title: title || 'Generated CER Report',
      device_name: device_name || 'FDA Product',
      manufacturer: manufacturer || 'Unknown Manufacturer',
      indication: metadata?.indication || 'Unknown Indication',
      report_date: new Date(),
      status: 'Active',
      content_text,
      metadata: metadata || {}
    };
    
    // Insert into database
    const [result] = await db.insert(clinicalEvaluationReports).values(cerData).returning();
    
    res.status(201).json({
      message: 'CER successfully saved to database',
      cer_id: result.cer_id,
      id: result.id
    });
  } catch (error) {
    console.error('Error saving CER to database:', error);
    res.status(500).json({ error: 'Failed to save CER to database' });
  }
});

export default router;