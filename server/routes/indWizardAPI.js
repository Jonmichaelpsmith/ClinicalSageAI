// server/routes/indWizardAPI.js

import express from 'express';

const router = express.Router();

// AI guidance for IND sections
router.post('/ai-guidance', (req, res) => {
  try {
    const { projectId, step, indData } = req.body;
    
    console.log(`Generating AI guidance for project ${projectId}, step: ${step}`);
    
    // Sample response data
    const guidanceData = {
      recommendations: [
        'Ensure all required fields are completed accurately',
        'Verify consistency between related sections',
        'Check for compliance with FDA guidelines for this section'
      ],
      risks: [
        {
          level: 'high',
          description: 'Missing information in critical sections',
          impact: 'May result in a refusal-to-file determination'
        },
        {
          level: 'medium',
          description: 'Inconsistent information across sections',
          impact: 'Could trigger requests for clarification, delaying review'
        }
      ],
      regulations: [
        {
          citation: '21 CFR 312.23(a)(1)',
          description: 'Requires a comprehensive table of contents',
          url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?fr=312.23'
        },
        {
          citation: 'FDA Guidance for Industry: IND Applications',
          description: 'Provides detailed instructions for specific IND components',
          url: 'https://www.fda.gov/drugs/investigational-new-drug-ind-application/ind-application-procedures'
        }
      ],
      timelineImpact: {
        critical: ['Complete Form FDA 1571', 'Prepare Investigator Brochure'],
        recommended: ['Conduct gap analysis of CMC data', 'Finalize study protocol']
      }
    };
    
    return res.json(guidanceData);
  } catch (error) {
    console.error('Error generating AI guidance:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Fetch IND projects (from database)
router.get('/projects', async (req, res) => {
  try {
    // Query the database for all projects
    const result = await db.query(`
      SELECT 
        project_id as id, 
        name, 
        drug_name as "drugName", 
        indication, 
        sponsor, 
        status, 
        progress, 
        updated_at as "lastUpdated" 
      FROM ind_projects
      ORDER BY updated_at DESC
    `);
    
    // If no projects found, seed with defaults for the first time
    if (result.rows.length === 0) {
      // Create default projects
      const defaultProjects = [
        {
          project_id: 'project-1',
          name: 'Enzymax Forte IND',
          drug_name: 'Enzymax Forte',
          indication: 'Pancreatic Enzyme Deficiency',
          sponsor: 'TrialSage Pharmaceuticals',
          status: 'in_progress',
          progress: 65,
          data: JSON.stringify({
            modules: {
              prePlanning: { status: 'completed', progress: 100 },
              nonclinicalData: { status: 'in_progress', progress: 85 },
              cmcData: { status: 'in_progress', progress: 70 },
              clinicalProtocol: { status: 'in_progress', progress: 60 },
              investigatorBrochure: { status: 'not_started', progress: 0 },
              fdaForms: { status: 'not_started', progress: 0 },
              finalAssembly: { status: 'not_started', progress: 0 }
            }
          })
        },
        {
          project_id: 'project-2',
          name: 'NeuroClear IND',
          drug_name: 'NeuroClear',
          indication: 'Alzheimer\'s Disease',
          sponsor: 'NeuroGenix Therapeutics',
          status: 'not_started',
          progress: 10,
          data: JSON.stringify({
            modules: {
              prePlanning: { status: 'in_progress', progress: 30 },
              nonclinicalData: { status: 'not_started', progress: 0 },
              cmcData: { status: 'not_started', progress: 0 },
              clinicalProtocol: { status: 'not_started', progress: 0 },
              investigatorBrochure: { status: 'not_started', progress: 0 },
              fdaForms: { status: 'not_started', progress: 0 },
              finalAssembly: { status: 'not_started', progress: 0 }
            }
          })
        },
        {
          project_id: 'project-3',
          name: 'CardioFlow IND',
          drug_name: 'CardioFlow',
          indication: 'Hypertension',
          sponsor: 'HeartWell Biosciences',
          status: 'completed',
          progress: 100,
          data: JSON.stringify({
            modules: {
              prePlanning: { status: 'completed', progress: 100 },
              nonclinicalData: { status: 'completed', progress: 100 },
              cmcData: { status: 'completed', progress: 100 },
              clinicalProtocol: { status: 'completed', progress: 100 },
              investigatorBrochure: { status: 'completed', progress: 100 },
              fdaForms: { status: 'completed', progress: 100 },
              finalAssembly: { status: 'completed', progress: 100 }
            }
          })
        }
      ];
      
      // Insert default projects
      for (const project of defaultProjects) {
        await db.query(`
          INSERT INTO ind_projects 
          (project_id, name, drug_name, indication, sponsor, status, progress, data) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          project.project_id,
          project.name,
          project.drug_name,
          project.indication,
          project.sponsor,
          project.status,
          project.progress,
          project.data
        ]);
      }
      
      // Get the newly inserted projects
      const insertedResult = await db.query(`
        SELECT 
          project_id as id, 
          name, 
          drug_name as "drugName", 
          indication, 
          sponsor, 
          status, 
          progress, 
          updated_at as "lastUpdated" 
        FROM ind_projects
        ORDER BY updated_at DESC
      `);
      
      return res.json(insertedResult.rows);
    }
    
    // Return the projects from the database
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching IND projects:', error);
    return res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
  }
});

// Get specific project (from database)
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Query the database for the specific project
    const result = await db.query(`
      SELECT 
        project_id as id, 
        name, 
        drug_name as "drugName", 
        indication, 
        sponsor as "sponsorName", 
        status, 
        progress, 
        target_date as "targetDate",
        updated_at as "lastUpdated", 
        data 
      FROM ind_projects
      WHERE project_id = $1
    `, [projectId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Get the project and parse the JSONB data
    const project = result.rows[0];
    const projectData = {
      ...project,
      modules: project.data?.modules || {
        prePlanning: { status: 'not_started', progress: 0 },
        nonclinicalData: { status: 'not_started', progress: 0 },
        cmcData: { status: 'not_started', progress: 0 },
        clinicalProtocol: { status: 'not_started', progress: 0 },
        investigatorBrochure: { status: 'not_started', progress: 0 },
        fdaForms: { status: 'not_started', progress: 0 },
        finalAssembly: { status: 'not_started', progress: 0 }
      }
    };
    
    delete projectData.data; // Remove the raw data field
    
    return res.json(projectData);
  } catch (error) {
    console.error(`Error fetching project ${req.params.projectId}:`, error);
    return res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
  }
});

// Create new IND project
router.post('/create', async (req, res) => {
  try {
    const { name, drugName, indication, sponsor } = req.body;
    
    // Validate required fields
    if (!name || !drugName || !indication) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, drugName, and indication are required' 
      });
    }
    
    // Generate a unique project ID
    const projectId = 'project-' + uuidv4().split('-')[0];
    
    // Default project data
    const defaultData = {
      modules: {
        prePlanning: { status: 'not_started', progress: 0 },
        nonclinicalData: { status: 'not_started', progress: 0 },
        cmcData: { status: 'not_started', progress: 0 },
        clinicalProtocol: { status: 'not_started', progress: 0 },
        investigatorBrochure: { status: 'not_started', progress: 0 },
        fdaForms: { status: 'not_started', progress: 0 },
        finalAssembly: { status: 'not_started', progress: 0 }
      }
    };
    
    // Insert the new project into the database
    const result = await db.query(`
      INSERT INTO ind_projects 
      (project_id, name, drug_name, indication, sponsor, status, progress, data) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        project_id as id, 
        name, 
        drug_name as "drugName", 
        indication, 
        sponsor, 
        status, 
        progress, 
        updated_at as "lastUpdated"
    `, [
      projectId,
      name,
      drugName,
      indication,
      sponsor || 'Unknown',
      'not_started',
      0,
      JSON.stringify(defaultData)
    ]);
    
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating IND project:', error);
    return res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
  }
});

// Save IND project data
router.post('/save-draft', async (req, res) => {
  try {
    const projectData = req.body;
    
    if (!projectData.id) {
      return res.status(400).json({ success: false, message: 'Missing project ID' });
    }
    
    // Check if the project exists
    const checkResult = await db.query(
      'SELECT project_id FROM ind_projects WHERE project_id = $1',
      [projectData.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Extract the data to save
    const {
      name = checkResult.rows[0].name,
      drugName,
      indication,
      sponsor,
      status,
      progress,
      targetDate,
      modules
    } = projectData;
    
    // Update the project in the database
    await db.query(`
      UPDATE ind_projects 
      SET 
        name = $1, 
        drug_name = $2, 
        indication = $3, 
        sponsor = $4, 
        status = $5, 
        progress = $6, 
        target_date = $7, 
        data = $8,
        updated_at = NOW()
      WHERE project_id = $9
    `, [
      name,
      drugName,
      indication,
      sponsor,
      status,
      progress,
      targetDate,
      JSON.stringify({ modules }),
      projectData.id
    ]);
    
    return res.json({ 
      success: true, 
      message: 'Project draft saved successfully', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error saving IND project draft:', error);
    return res.status(500).json({ success: false, message: 'Database Error: ' + error.message });
  }
});

// Generate IND timeline
router.post('/generate-timeline', (req, res) => {
  try {
    const { projectId, indData } = req.body;
    
    // In a production environment, this would use an AI service and database
    console.log(`Generating timeline for project ${projectId}:`, indData);
    
    // Sample timeline data
    const timelineData = {
      projectId,
      generatedDate: new Date().toISOString(),
      targetSubmissionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: [
        { title: 'Complete Pre-IND Meeting', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
        { title: 'Finalize CMC Documentation', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
        { title: 'Complete Clinical Protocol', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
        { title: 'Prepare Investigator Brochure', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
        { title: 'Final IND Assembly', dueDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
      ]
    };
    
    return res.json(timelineData);
  } catch (error) {
    console.error('Error generating IND timeline:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Field-specific guidance endpoint
router.post('/field-guidance', (req, res) => {
  try {
    const { projectId, step, field, indData } = req.body;
    
    console.log(`Generating field guidance for project ${projectId}, step: ${step}, field: ${field}`);
    
    // Sample field guidance
    const fieldGuidanceData = {
      field,
      recommendations: [
        `Ensure ${field} is properly documented according to FDA guidelines`,
        `Cross-reference ${field} with related information in other sections`,
        `Consider including additional details about ${field} for clarity`
      ],
      examples: [
        {
          description: 'Example of well-formatted content',
          text: `This is an example of how ${field} should be documented properly...`
        }
      ],
      regulations: [
        {
          citation: '21 CFR 312.23',
          relevance: `This regulation specifically addresses requirements for ${field}`
        }
      ]
    };
    
    return res.json(fieldGuidanceData);
  } catch (error) {
    console.error('Error generating field guidance:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Section assessment endpoint
router.post('/section-assessment', (req, res) => {
  try {
    const { projectId, step, indData } = req.body;
    
    console.log(`Performing section assessment for project ${projectId}, step: ${step}`);
    
    // Sample section assessment
    const assessmentData = {
      step,
      completeness: 75,
      qualityScore: 82,
      issues: [
        {
          severity: 'medium',
          description: 'Some required information is missing or incomplete',
          recommendation: 'Review and complete all required fields in this section'
        },
        {
          severity: 'low',
          description: 'Formatting inconsistencies detected',
          recommendation: 'Standardize formatting for better readability'
        }
      ],
      regulatoryAlignment: {
        status: 'generally_aligned',
        notes: 'Content aligns with FDA expectations but could benefit from additional detail in key areas'
      },
      nextSteps: [
        'Complete missing information',
        'Enhance technical details where noted',
        'Add supporting references where appropriate'
      ]
    };
    
    return res.json(assessmentData);
  } catch (error) {
    console.error('Error performing section assessment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Assemble IND (final submission)
router.post('/assemble', (req, res) => {
  try {
    const { projectId, sequence } = req.body;
    
    // In production, this would trigger a workflow to assemble the IND package
    console.log(`Assembling IND for project ${projectId || 'unknown'} with sequence ${sequence || '0000'}`);
    
    // Generate a sample object ID for the package
    const zipObjectId = `ind-pkg-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    
    return res.json({
      success: true,
      message: 'IND assembly initiated successfully',
      zipObjectId,
      estimatedTimeMinutes: 10,
      packageAvailableAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error assembling IND:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;