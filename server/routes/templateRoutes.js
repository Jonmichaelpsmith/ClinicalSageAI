const express = require('express');
const multer = require('multer');
const templateService = require('../services/templateService');
const router = express.Router();
const logger = require('../utils/logger').createLogger('template-routes');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword', // doc
      'application/pdf', // pdf
      'text/plain', // txt
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Word documents, PDFs, and text files are allowed.'), false);
    }
  },
});

/**
 * @route GET /api/templates
 * @description Get all templates, with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    // Extract filter parameters from query
    const filters = {
      module: req.query.module,
      sectionId: req.query.sectionId,
      status: req.query.status,
      searchText: req.query.search,
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const templates = await templateService.getAllTemplates(filters);
    res.json(templates);
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch templates' });
  }
});

/**
 * @route GET /api/templates/:id
 * @description Get a specific template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    res.json(template);
  } catch (error) {
    if (error.message === 'Template not found') {
      res.status(404).json({ error: 'Template not found' });
    } else {
      logger.error(`Error fetching template ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to fetch template' });
    }
  }
});

/**
 * @route POST /api/templates
 * @description Create a new template
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      // Convert string "true" and "false" to booleans
      required: req.body.required === 'true',
      // Add file content if present
      fileContent: req.file ? req.file.buffer : null,
    };
    
    // If sections is provided as a string, convert it to an array
    if (typeof templateData.sections === 'string') {
      try {
        templateData.sections = JSON.parse(templateData.sections);
      } catch (err) {
        logger.warn('Error parsing sections JSON:', err);
        templateData.sections = [];
      }
    }
    
    const template = await templateService.createTemplate(templateData);
    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ error: error.message || 'Failed to create template' });
  }
});

/**
 * @route PUT /api/templates/:id
 * @description Update an existing template
 */
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const templateData = {
      ...req.body,
    };
    
    // Convert string "true" and "false" to booleans if present
    if (req.body.required !== undefined) {
      templateData.required = req.body.required === 'true';
    }
    
    // Add file content if present
    if (req.file) {
      templateData.fileContent = req.file.buffer;
    }
    
    // If sections is provided as a string, convert it to an array
    if (typeof templateData.sections === 'string') {
      try {
        templateData.sections = JSON.parse(templateData.sections);
      } catch (err) {
        logger.warn('Error parsing sections JSON:', err);
        templateData.sections = [];
      }
    }
    
    const template = await templateService.updateTemplate(req.params.id, templateData);
    res.json(template);
  } catch (error) {
    if (error.message === 'Template not found') {
      res.status(404).json({ error: 'Template not found' });
    } else {
      logger.error(`Error updating template ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to update template' });
    }
  }
});

/**
 * @route DELETE /api/templates/:id
 * @description Delete a template
 */
router.delete('/:id', async (req, res) => {
  try {
    await templateService.deleteTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Template not found') {
      res.status(404).json({ error: 'Template not found' });
    } else {
      logger.error(`Error deleting template ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to delete template' });
    }
  }
});

/**
 * @route POST /api/templates/:id/upload
 * @description Upload a file to an existing template
 */
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const template = await templateService.uploadTemplateFile(
      req.params.id,
      req.file.buffer,
      req.file.originalname
    );
    res.json(template);
  } catch (error) {
    if (error.message === 'Template not found') {
      res.status(404).json({ error: 'Template not found' });
    } else {
      logger.error(`Error uploading file for template ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  }
});

/**
 * @route GET /api/templates/:id/file
 * @description Download a template file
 */
router.get('/:id/file', async (req, res) => {
  try {
    const { content, fileName } = await templateService.getTemplateFile(req.params.id);
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send the file
    res.send(content);
  } catch (error) {
    if (error.message === 'Template not found' || error.message === 'Template has no associated file') {
      res.status(404).json({ error: error.message });
    } else {
      logger.error(`Error downloading file for template ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to download file' });
    }
  }
});

/**
 * @route POST /api/templates/import
 * @description Import multiple templates at once
 */
router.post('/import', async (req, res) => {
  try {
    const { templates } = req.body;
    
    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({ error: 'No templates provided for import' });
    }
    
    const result = await templateService.importTemplates(templates);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error importing templates:', error);
    res.status(500).json({ error: error.message || 'Failed to import templates' });
  }
});

module.exports = router;