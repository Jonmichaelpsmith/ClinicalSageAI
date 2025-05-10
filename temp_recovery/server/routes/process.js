/**
 * Process Parameter Routes - Server-side API routes for Process Parameter Library
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for process parameters
let processParameters = [
  {
    id: 'pp-1',
    name: 'Mixing Speed',
    code: 'MIX-SPD',
    description: 'Impeller rotation speed during blending',
    unit: 'rpm',
    category: 'Blending',
    process: 'Wet Granulation',
    range: {
      min: 200,
      max: 400,
      target: 300
    },
    classification: 'CPP',
    impact: 'High',
    variability: 'Medium',
    controlStrategy: 'Process controls, equipment qualification',
    criticalityJustification: 'Affects granule size distribution and powder blend homogeneity',
    analysisMethod: 'Equipment readout, impeller torque monitoring',
    tags: ['Blending', 'Granulation', 'Speed']
  },
  {
    id: 'pp-2',
    name: 'Granulation End Point',
    code: 'GRAN-EP',
    description: 'Power consumption at the granulation end point',
    unit: 'W',
    category: 'Granulation',
    process: 'Wet Granulation',
    range: {
      min: 1500,
      max: 2000,
      target: 1750
    },
    classification: 'CPP',
    impact: 'High',
    variability: 'Low',
    controlStrategy: 'Process controls, power consumption monitoring',
    criticalityJustification: 'Direct impact on granule properties and dissolution profile',
    analysisMethod: 'Power consumption curve analysis',
    tags: ['Granulation', 'End Point', 'Power Consumption']
  },
  {
    id: 'pp-3',
    name: 'Drying Temperature',
    code: 'DRY-TEMP',
    description: 'Inlet air temperature during fluid bed drying',
    unit: '°C',
    category: 'Drying',
    process: 'Wet Granulation',
    range: {
      min: 55,
      max: 65,
      target: 60
    },
    classification: 'CPP',
    impact: 'High',
    variability: 'Low',
    controlStrategy: 'Process controls, temperature monitoring and control',
    criticalityJustification: 'Affects residual moisture content and stability of active ingredient',
    analysisMethod: 'Temperature probe, product temperature monitoring',
    tags: ['Drying', 'Temperature', 'Moisture']
  },
  {
    id: 'pp-4',
    name: 'Tablet Compression Force',
    code: 'COMP-FRC',
    description: 'Main compression force during tablet compression',
    unit: 'kN',
    category: 'Compression',
    process: 'Tablet Compression',
    range: {
      min: 10,
      max: 20,
      target: 15
    },
    classification: 'CPP',
    impact: 'High',
    variability: 'Medium',
    controlStrategy: 'In-process controls, compression force monitoring',
    criticalityJustification: 'Direct impact on tablet hardness, friability, and dissolution',
    analysisMethod: 'Force transducer, tablet press instrumentation',
    tags: ['Compression', 'Force', 'Tablet']
  },
  {
    id: 'pp-5',
    name: 'Coating Spray Rate',
    code: 'COAT-SPR',
    description: 'Spray rate during tablet film coating',
    unit: 'g/min',
    category: 'Coating',
    process: 'Film Coating',
    range: {
      min: 40,
      max: 60,
      target: 50
    },
    classification: 'CPP',
    impact: 'Medium',
    variability: 'Medium',
    controlStrategy: 'Process controls, spray rate calibration',
    criticalityJustification: 'Affects film quality, appearance, and coating uniformity',
    analysisMethod: 'Pump speed calibration, weight gain monitoring',
    tags: ['Coating', 'Spray Rate', 'Film']
  }
];

/**
 * Get all process parameters
 * 
 * @route GET /api/process/parameters
 * @param {string} req.query.category - Filter by category (optional)
 * @param {string} req.query.process - Filter by process (optional)
 * @param {string} req.query.classification - Filter by classification (optional)
 * @param {string} req.query.search - Search keyword (optional)
 * @returns {Object} - List of process parameters
 */
router.get('/parameters', (req, res) => {
  let filtered = [...processParameters];
  
  // Apply filters if provided
  if (req.query.category) {
    filtered = filtered.filter(p => p.category === req.query.category);
  }
  
  if (req.query.process) {
    filtered = filtered.filter(p => p.process === req.query.process);
  }
  
  if (req.query.classification) {
    filtered = filtered.filter(p => p.classification === req.query.classification);
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.code.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(search)))
    );
  }
  
  res.json({
    success: true,
    parameters: filtered
  });
});

/**
 * Get a process parameter by ID
 * 
 * @route GET /api/process/parameters/:parameterId
 * @param {string} req.params.parameterId - Process parameter ID
 * @returns {Object} - Process parameter data
 */
router.get('/parameters/:parameterId', (req, res) => {
  const parameter = processParameters.find(p => p.id === req.params.parameterId);
  
  if (!parameter) {
    return res.status(404).json({
      success: false,
      error: 'Process parameter not found'
    });
  }
  
  res.json({
    success: true,
    parameter
  });
});

/**
 * Create a new process parameter
 * 
 * @route POST /api/process/parameters
 * @param {Object} req.body - Process parameter data
 * @returns {Object} - Created process parameter
 */
router.post('/parameters', (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.process) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and process are required fields'
      });
    }
    
    const newParameter = {
      id: `pp-${uuidv4()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    processParameters.push(newParameter);
    
    res.status(201).json({
      success: true,
      parameter: newParameter
    });
  } catch (error) {
    console.error('Error creating process parameter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create process parameter'
    });
  }
});

/**
 * Update a process parameter
 * 
 * @route PUT /api/process/parameters/:parameterId
 * @param {string} req.params.parameterId - Process parameter ID
 * @param {Object} req.body - Updated process parameter data
 * @returns {Object} - Updated process parameter
 */
router.put('/parameters/:parameterId', (req, res) => {
  try {
    const index = processParameters.findIndex(p => p.id === req.params.parameterId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Process parameter not found'
      });
    }
    
    const updatedParameter = {
      ...processParameters[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    processParameters[index] = updatedParameter;
    
    res.json({
      success: true,
      parameter: updatedParameter
    });
  } catch (error) {
    console.error('Error updating process parameter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update process parameter'
    });
  }
});

/**
 * Delete a process parameter
 * 
 * @route DELETE /api/process/parameters/:parameterId
 * @param {string} req.params.parameterId - Process parameter ID
 * @returns {Object} - Success message
 */
router.delete('/parameters/:parameterId', (req, res) => {
  try {
    const initialLength = processParameters.length;
    processParameters = processParameters.filter(p => p.id !== req.params.parameterId);
    
    if (processParameters.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Process parameter not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Process parameter deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting process parameter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete process parameter'
    });
  }
});

/**
 * Get process parameter categories
 * 
 * @route GET /api/process/categories
 * @returns {Object} - List of categories
 */
router.get('/categories', (req, res) => {
  const categories = [...new Set(processParameters.map(p => p.category))];
  
  res.json({
    success: true,
    categories
  });
});

/**
 * Get process types
 * 
 * @route GET /api/process/types
 * @returns {Object} - List of process types
 */
router.get('/types', (req, res) => {
  const processes = [...new Set(processParameters.map(p => p.process))];
  
  res.json({
    success: true,
    processes
  });
});

/**
 * Get process parameter statistics
 * 
 * @route GET /api/process/stats
 * @returns {Object} - Process parameter statistics
 */
router.get('/stats', (req, res) => {
  const stats = {
    totalParameters: processParameters.length,
    byClassification: processParameters.reduce((acc, curr) => {
      acc[curr.classification] = (acc[curr.classification] || 0) + 1;
      return acc;
    }, {}),
    byImpact: processParameters.reduce((acc, curr) => {
      acc[curr.impact] = (acc[curr.impact] || 0) + 1;
      return acc;
    }, {}),
    byProcess: processParameters.reduce((acc, curr) => {
      acc[curr.process] = (acc[curr.process] || 0) + 1;
      return acc;
    }, {})
  };
  
  res.json({
    success: true,
    stats
  });
});

export default router;