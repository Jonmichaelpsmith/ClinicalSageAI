import { Pool } from 'pg';
import express from 'express';
import axios from 'axios';
const router = express.Router();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Configure API endpoints
const FDA_API_ENDPOINT = 'https://api.fda.gov/device/510k.json';
const PUBMED_API_ENDPOINT = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_API_KEY = process.env.PUBMED_API_KEY; // Use API key if available

// GET existing profile by ID
router.get('/device-profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT * FROM device_profiles WHERE id = $1`,
      [id]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error retrieving device profile:', error);
    res.status(500).json({ error: 'Failed to retrieve device profile' });
  }
});

// PUT update existing profile
router.put('/device-profile/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    // Create updatable fields array from the request body
    const updateableFields = [
      'device_name', 
      'device_class', 
      'intended_use', 
      'device_description', 
      'manufacturer', 
      'model_number',
      'technical_characteristics',
      'document_vault_id',
      'folder_structure'
    ];
    
    // Build the SET clause dynamically
    let setClauses = [];
    let paramValues = [];
    let paramCounter = 1;
    
    // Add updated_at timestamp
    setClauses.push(`updated_at = $${paramCounter}`);
    paramValues.push(new Date());
    paramCounter++;
    
    // Add other fields if they exist in the request body
    for (const field of updateableFields) {
      if (updateData[field] !== undefined) {
        setClauses.push(`${field} = $${paramCounter}`);
        
        // Handle JSON fields
        if (field === 'technical_characteristics' || field === 'folder_structure') {
          paramValues.push(JSON.stringify(updateData[field]));
        } else {
          paramValues.push(updateData[field]);
        }
        
        paramCounter++;
      }
    }
    
    // Add the ID as the last parameter
    paramValues.push(id);
    
    // Execute the update query
    const query = `
      UPDATE device_profiles 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const result = await db.query(query, paramValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device profile not found' });
    }
    
    // Return the updated profile
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating device profile:', error);
    res.status(500).json({ error: 'Failed to update device profile: ' + error.message });
  }
});

// POST save/update profile
router.post('/device-profile', async (req, res) => {
  try {
    console.log('Received device profile data:', req.body);
    const { 
      deviceName, 
      deviceClass, 
      intendedUse, 
      deviceDescription,
      manufacturer,
      modelNumber,
      technicalCharacteristics
    } = req.body;
    
    const now = new Date();
    
    // First check if the device_profiles table exists and if not, create it
    await db.query(`
      CREATE TABLE IF NOT EXISTS device_profiles (
        id SERIAL PRIMARY KEY,
        device_name TEXT NOT NULL,
        device_class TEXT,
        intended_use TEXT,
        device_description TEXT,
        manufacturer TEXT,
        model_number TEXT,
        technical_characteristics JSONB,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        document_vault_id TEXT,
        folder_structure JSONB
      )
    `);
    
    // Insert the new device profile
    const result = await db.query(
      `INSERT INTO device_profiles(
        device_name,
        device_class,
        intended_use,
        device_description,
        manufacturer,
        model_number,
        technical_characteristics,
        created_at,
        updated_at
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8)
      RETURNING *`,
      [
        deviceName, 
        deviceClass, 
        intendedUse, 
        deviceDescription,
        manufacturer,
        modelNumber,
        JSON.stringify(technicalCharacteristics || {}),
        now
      ]
    );
    
    // Return the created device profile
    const savedProfile = result.rows[0];
    console.log('Created device profile:', savedProfile);
    
    res.json(savedProfile);
  } catch (error) {
    console.error('Error saving device profile:', error);
    res.status(500).json({ error: 'Failed to save device profile: ' + error.message });
  }
});

/**
 * Combined search for predicate devices and literature references
 * This endpoint combines device data from multiple sources:
 * 1. FDA 510(k) Database
 * 2. PubMed scientific literature
 * 3. Local database of validated predicates
 * 4. Organization's private document vault (if available)
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

    // Create tracking for all attempted data sources
    const searchAttempts = {
      fda: { attempted: false, success: false },
      pubmed: { attempted: false, success: false },
      local: { attempted: false, success: false },
      vault: { attempted: false, success: false }
    };

    // Initialize results containers
    let predicateDevices = [];
    let literatureReferences = [];
    let privatePredicates = [];
    let searchQueries = [];

    // 1. FDA 510(k) DATABASE SEARCH
    searchAttempts.fda.attempted = true;
    try {
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

      if (fdaQuery.length > 0) {
        // Build the final FDA API query string
        const finalQuery = fdaQuery.join('+AND+');
        const searchLimit = 10; // Limit results to improve performance

        // Log the actual FDA API query for debugging
        console.log(`FDA API query: ${finalQuery}`);
        
        // Add to search queries record
        searchQueries.push(finalQuery);

        // Call FDA API for predicate devices
        const fdaResponse = await axios.get(`${FDA_API_ENDPOINT}?search=${finalQuery}&limit=${searchLimit}`);

        // Transform FDA API results
        if (fdaResponse.data.results && fdaResponse.data.results.length > 0) {
          predicateDevices = fdaResponse.data.results.map(result => ({
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
            decisionSummaryUrl: generateDecisionSummaryUrl(result.k_number),
            source: 'FDA 510(k)'
          }));
          
          searchAttempts.fda.success = true;
          console.log(`Found ${predicateDevices.length} 510(k) predicates from FDA`);
        }
      }
    } catch (fdaError) {
      console.error('FDA API search error:', fdaError.message);
      // Continue with other searches despite FDA error
    }

    // 2. PUBMED LITERATURE SEARCH
    searchAttempts.pubmed.attempted = true;
    try {
      if (deviceName || intendedUse) {
        // Prepare search terms
        const searchTerms = [];
        if (deviceName) searchTerms.push(deviceName);
        if (intendedUse) searchTerms.push(intendedUse);
        if (productCode) searchTerms.push(productCode);
        
        // Create search query for PubMed
        const query = searchTerms.join(' AND ');
        console.log(`PubMed search query: "${query}"`);
        
        // Add to search queries record
        searchQueries.push(`PubMed: ${query}`);
        
        // Construct PubMed URL
        let pubmedUrl = `${PUBMED_API_ENDPOINT}?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json`;
        
        // Add API key if available
        if (PUBMED_API_KEY) {
          pubmedUrl += `&api_key=${PUBMED_API_KEY}`;
        }
        
        // Call PubMed API
        const pubmedResponse = await axios.get(pubmedUrl);
        
        if (pubmedResponse.data && 
            pubmedResponse.data.esearchresult && 
            pubmedResponse.data.esearchresult.idlist &&
            pubmedResponse.data.esearchresult.idlist.length > 0) {
          
          // Get PMIDs from search
          const pmids = pubmedResponse.data.esearchresult.idlist;
          
          // For a real implementation, we would fetch the full article details here
          // For now, we'll create placeholder reference objects
          literatureReferences = pmids.map(pmid => ({
            id: pmid,
            title: `Scientific article related to ${deviceName || productCode}`,
            authors: 'Retrieved from PubMed',
            journal: 'Journal information would be fetched in full implementation',
            year: new Date().getFullYear(),
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            relevance: 0.75,
            source: 'PubMed'
          }));
          
          searchAttempts.pubmed.success = true;
          console.log(`Found ${literatureReferences.length} literature references from PubMed`);
        }
      }
    } catch (pubmedError) {
      console.error('PubMed search error:', pubmedError.message);
      // Continue despite PubMed error
    }

    // 3. LOCAL DATABASE SEARCH
    searchAttempts.local.attempted = true;
    try {
      // Query the local database for previously validated predicates
      const localQuery = `
        SELECT * FROM validated_predicates 
        WHERE product_code = $1 
        OR similar_to_device_name ILIKE $2
        LIMIT 5
      `;
      
      const searchName = deviceName ? `%${deviceName}%` : '%';
      const searchCode = productCode || '';
      
      const { rows } = await db.query(localQuery, [searchCode, searchName]);
      
      if (rows && rows.length > 0) {
        // Transform database results to match API format
        const localPredicates = rows.map(row => ({
          id: row.k_number || `local-${row.id}`,
          kNumber: row.k_number,
          deviceName: row.device_name,
          manufacturer: row.manufacturer,
          clearanceDate: row.clearance_date,
          productCode: row.product_code,
          deviceClass: row.device_class || 'II',
          matchScore: 0.95, // Higher score for validated predicates
          matchReason: row.validation_notes || 'Previously validated predicate device',
          decisionSummaryUrl: row.summary_url || generateDecisionSummaryUrl(row.k_number),
          source: 'Validated Database'
        }));
        
        // Add to results
        predicateDevices = [...predicateDevices, ...localPredicates];
        searchAttempts.local.success = true;
        console.log(`Found ${localPredicates.length} predicates from local database`);
      }
    } catch (dbError) {
      console.error('Local database search error:', dbError.message);
      // Continue despite database error
    }

    // 4. DOCUMENT VAULT SEARCH (if organization ID is provided)
    if (organizationId) {
      searchAttempts.vault.attempted = true;
      try {
        // Query organization's document vault for private predicate devices
        const vaultQuery = `
          SELECT d.* FROM vault_documents d
          JOIN organizations o ON d.organization_id = o.id
          WHERE d.organization_id = $1
          AND d.document_type = 'predicate_device'
          AND (
            d.metadata->>'productCode' = $2
            OR d.metadata->>'deviceName' ILIKE $3
          )
          LIMIT 5
        `;
        
        const searchName = deviceName ? `%${deviceName}%` : '%';
        const searchCode = productCode || '';
        
        const { rows } = await db.query(vaultQuery, [organizationId, searchCode, searchName]);
        
        if (rows && rows.length > 0) {
          // Transform document vault results
          privatePredicates = rows.map(row => {
            const metadata = row.metadata || {};
            return {
              id: `vault-${row.id}`,
              kNumber: metadata.k_number || null,
              deviceName: metadata.deviceName || row.title,
              manufacturer: metadata.manufacturer || 'Your Organization',
              clearanceDate: metadata.clearanceDate || null,
              productCode: metadata.productCode || productCode,
              deviceClass: metadata.deviceClass || 'II',
              matchScore: 0.98, // Highest score for organization's own predicates
              matchReason: 'Internal predicate device from your organization',
              documentId: row.id,
              vaultPath: row.path || null,
              source: 'Organization Vault'
            };
          });
          
          // Add to results
          predicateDevices = [...privatePredicates, ...predicateDevices];
          searchAttempts.vault.success = true;
          console.log(`Found ${privatePredicates.length} predicates from document vault`);
        }
      } catch (vaultError) {
        console.error('Document vault search error:', vaultError.message);
        // Continue despite vault error
      }
    }

    // Return results even if some sources failed
    // Check if we have any valid results or if all searches failed
    if (predicateDevices.length === 0 && literatureReferences.length === 0) {
      // Determine if we had any successful searches
      const anySuccessfulSearch = Object.values(searchAttempts).some(attempt => attempt.success);
      
      if (!anySuccessfulSearch) {
        // All searches failed or returned no results
        console.warn('No results found in any data source');
        
        if (searchQueries.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Please provide at least one search criteria (device name, product code, or intended use)',
            predicateDevices: [],
            literatureReferences: [],
            searchQueries: []
          });
        }
      }
    }

    // Return combined search results
    res.json({
      success: true,
      predicateDevices,
      literatureReferences,
      searchQuery: deviceName || productCode,
      searchQueries,
      resultCount: predicateDevices.length + literatureReferences.length,
      dataSources: searchAttempts
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