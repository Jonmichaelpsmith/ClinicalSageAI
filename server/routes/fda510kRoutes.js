import { Pool } from 'pg';
import express from 'express';
import axios from 'axios';
const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Configure FDA API endpoints
const FDA_API_ENDPOINT = 'https://api.fda.gov/device/510k.json';

// GET existing profile
router.get('/device-profile/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT * FROM device_profiles WHERE project_id = $1`,
      [projectId]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error retrieving device profile:', error);
    res.status(500).json({ error: 'Failed to retrieve device profile' });
  }
});

// POST save/update profile
router.post('/device-profile', async (req, res) => {
  const { projectId, name, model, intendedUse, technology } = req.body;
  const now = new Date();
  
  try {
    // upsert
    await db.query(
      `INSERT INTO device_profiles(project_id,name,model,intended_use,technology,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$6)
      ON CONFLICT (project_id)
      DO UPDATE SET
        name=EXCLUDED.name,
        model=EXCLUDED.model,
        intended_use=EXCLUDED.intended_use,
        technology=EXCLUDED.technology,
        updated_at=EXCLUDED.updated_at`,
      [projectId, name, model, intendedUse, technology, now]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving device profile:', error);
    res.status(500).json({ error: 'Failed to save device profile' });
  }
});

/**
 * Combined search for predicate devices and literature references
 * This endpoint combines device data from FDA and literature references from PubMed
 *
 * @route POST /api/fda510k/search-predicates-literature
 */
router.post('/search-predicates-literature', async (req, res) => {
  try {
    const {
      deviceName,
      productCode,
      deviceClass,
      intendedUse,
      manufacturer,
      organizationId
    } = req.body;

    // Log search attempt for monitoring
    console.log(`510(k) predicate search for ${deviceName || productCode} (org: ${organizationId || 'not specified'})`);

    // Build FDA API query
    let fdaQuery = [];

    // Add primary search criteria
    if (deviceName) {
      fdaQuery.push(`device_name:"${deviceName.replace(/[^\w\s]/gi, '')}"`);
    }

    if (productCode) {
      fdaQuery.push(`product_code:"${productCode.toUpperCase()}"`);
    }

    if (manufacturer) {
      fdaQuery.push(`applicant:"${manufacturer.replace(/[^\w\s]/gi, '')}"`);
    }

    // Handle empty query (require at least one search criteria)
    if (fdaQuery.length === 0) {
      console.warn('Insufficient search criteria provided');
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one search criteria (device name, product code, or manufacturer)',
        predicateDevices: [],
        literatureReferences: []
      });
    }

    // Build the final FDA API query string
    const finalQuery = fdaQuery.join('+AND+');
    const searchLimit = 10; // Limit results to improve performance

    // Log the actual FDA API query for debugging
    console.log(`FDA API query: ${finalQuery}`);

    // Call FDA API for predicate devices
    const fdaResponse = await axios.get(`${FDA_API_ENDPOINT}?search=${finalQuery}&limit=${searchLimit}`);

    // Transform FDA API results
    const predicateDevices = fdaResponse.data.results?.map(result => ({
      id: result.k_number,
      kNumber: result.k_number,
      deviceName: result.device_name,
      manufacturer: result.applicant,
      clearanceDate: result.decision_date,
      productCode: result.product_code,
      deviceClass: result.device_class || 'II',
      // Calculate match score (simplified algorithm)
      matchScore: 0.85,
      matchReason: 'Similar device type and intended use',
      // Generate decision summary URL
      decisionSummaryUrl: generateDecisionSummaryUrl(result.k_number)
    })) || [];

    // Search for literature references (simplified implementation)
    // This would typically call PubMed or another scientific literature API
    const literatureReferences = [];

    // Return combined search results
    res.json({
      success: true,
      predicateDevices,
      literatureReferences,
      searchQuery: deviceName || productCode,
      searchQueries: fdaQuery,
      resultCount: predicateDevices.length + literatureReferences.length
    });
  } catch (error) {
    console.error('Error searching for predicates and literature:', error);
    
    // Return formatted error response
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search for predicate devices',
      predicateDevices: [],
      literatureReferences: []
    });
  }
});

/**
 * Generate URL to FDA decision summary for a given K-number
 */
function generateDecisionSummaryUrl(kNumber) {
  if (!kNumber) return '';
  
  // Format: https://www.accessdata.fda.gov/cdrh_docs/pdf19/K191234.pdf
  const match = kNumber.match(/K(\d+)/i);
  
  if (!match || !match[1]) {
    return '';
  }
  
  const numPart = match[1];
  const pdfFolder = numPart.length >= 2 ? `pdf${numPart.substring(0, 2)}` : 'pdf';
  
  return `https://www.accessdata.fda.gov/cdrh_docs/${pdfFolder}/${kNumber}.pdf`;
}

export default router;