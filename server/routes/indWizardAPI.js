// server/routes/indWizardAPI.js

const express = require('express');
const router = express.Router();

// Fetch IND projects
router.get('/projects', (req, res) => {
  try {
    // In a production environment, this would query a database
    const sampleProjects = [
      {
        id: 'project-1',
        name: 'Enzymax Forte IND',
        drugName: 'Enzymax Forte',
        indication: 'Pancreatic Enzyme Deficiency',
        sponsor: 'TrialSage Pharmaceuticals',
        status: 'in_progress',
        progress: 65,
        lastUpdated: '2025-04-20T14:30:00Z'
      },
      {
        id: 'project-2',
        name: 'NeuroClear IND',
        drugName: 'NeuroClear',
        indication: 'Alzheimer\'s Disease',
        sponsor: 'NeuroGenix Therapeutics',
        status: 'not_started',
        progress: 10,
        lastUpdated: '2025-04-15T09:45:00Z'
      },
      {
        id: 'project-3',
        name: 'CardioFlow IND',
        drugName: 'CardioFlow',
        indication: 'Hypertension',
        status: 'completed',
        sponsor: 'HeartWell Biosciences',
        progress: 100,
        lastUpdated: '2025-03-28T16:20:00Z'
      }
    ];

    return res.json(sampleProjects);
  } catch (error) {
    console.error('Error fetching IND projects:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Get specific project
router.get('/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In production, fetch from database using projectId
    const projectData = {
      id: projectId,
      name: `IND-${projectId}`,
      drugName: 'Enzymax Forte',
      indication: 'Pancreatic Enzyme Deficiency',
      sponsorName: 'TrialSage Pharmaceuticals',
      status: 'in_progress',
      progress: 65,
      targetDate: '2025-06-15',
      lastUpdated: new Date().toISOString(),
      modules: {
        prePlanning: { status: 'completed', progress: 100 },
        nonclinicalData: { status: 'in_progress', progress: 85 },
        cmcData: { status: 'in_progress', progress: 70 },
        clinicalProtocol: { status: 'in_progress', progress: 60 },
        investigatorBrochure: { status: 'not_started', progress: 0 },
        fdaForms: { status: 'not_started', progress: 0 },
        finalAssembly: { status: 'not_started', progress: 0 }
      }
    };

    return res.json(projectData);
  } catch (error) {
    console.error(`Error fetching project ${req.params.projectId}:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Save IND project data
router.post('/save-draft', (req, res) => {
  try {
    const projectData = req.body;
    
    // In a production environment, this would save to a database
    console.log('Saving IND project draft:', projectData);
    
    // Simulating successful save
    return res.json({ success: true, message: 'Project draft saved successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving IND project draft:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
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

module.exports = router;