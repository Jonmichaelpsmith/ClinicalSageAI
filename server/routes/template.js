/**
 * Template Routes - Server-side API routes for Template Management
 */

import express from 'express';
import * as templateService from '../services/templateService.js';

const router = express.Router();

/**
 * Get all templates
 * 
 * @route GET /api/templates
 * @param {string} req.query.category - Filter by category (optional)
 * @param {string} req.query.search - Search keyword (optional)
 * @returns {Object} - List of templates
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let templates;
    
    if (category) {
      // Filter by category
      templates = await templateService.getTemplatesByCategory(category);
    } else if (search) {
      // Search by keyword
      templates = await templateService.searchTemplates(search);
    } else {
      // Get all templates
      templates = await templateService.getAllTemplates();
    }
    
    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get templates'
    });
  }
});

/**
 * Get template by ID
 * 
 * @route GET /api/templates/:templateId
 * @param {string} req.params.templateId - Template ID
 * @returns {Object} - Template data
 */
router.get('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await templateService.getTemplateById(templateId);
    await templateService.incrementUsageCount(templateId);
    
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error(`Error getting template ${req.params.templateId}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to get template'
    });
  }
});

/**
 * Create a new template
 * 
 * @route POST /api/templates
 * @param {Object} req.body - Template data
 * @returns {Object} - Created template
 */
router.post('/', async (req, res) => {
  try {
    console.log('Creating new template with data:', JSON.stringify(req.body, null, 2));
    
    const template = await templateService.saveTemplate(req.body);
    
    res.status(201).json({
      success: true,
      template,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create template'
    });
  }
});

/**
 * Update a template
 * 
 * @route PUT /api/templates/:templateId
 * @param {string} req.params.templateId - Template ID
 * @param {Object} req.body - Updated template data
 * @returns {Object} - Updated template
 */
router.put('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    console.log(`Updating template ${templateId} with data:`, JSON.stringify(req.body, null, 2));
    
    const template = await templateService.updateTemplate(templateId, req.body);
    
    res.json({
      success: true,
      template,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error(`Error updating template ${req.params.templateId}:`, error);
    res.status(error.message.includes('not found') ? 404 : 400).json({
      success: false,
      error: error.message || 'Failed to update template'
    });
  }
});

/**
 * Delete a template
 * 
 * @route DELETE /api/templates/:templateId
 * @param {string} req.params.templateId - Template ID
 * @returns {Object} - Success message
 */
router.delete('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    await templateService.deleteTemplate(templateId);
    
    res.json({
      success: true,
      message: `Template ${templateId} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting template ${req.params.templateId}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to delete template'
    });
  }
});

/**
 * Import template from an external source
 * 
 * @route POST /api/templates/import
 * @param {Object} req.body - Template data to import
 * @returns {Object} - Imported template
 */
router.post('/import', async (req, res) => {
  try {
    console.log('Importing template with data:', JSON.stringify(req.body, null, 2));
    
    // Generate a unique ID if not provided
    const templateData = {
      ...req.body,
      id: req.body.id || `imported-${Date.now()}`
    };
    
    const template = await templateService.saveTemplate(templateData);
    
    res.status(201).json({
      success: true,
      template,
      message: 'Template imported successfully'
    });
  } catch (error) {
    console.error('Error importing template:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to import template'
    });
  }
});

/**
 * Apply template to a document
 * 
 * @route POST /api/templates/:templateId/apply
 * @param {string} req.params.templateId - Template ID
 * @param {Object} req.body - Document data to apply template to
 * @returns {Object} - Document with template applied
 */
router.post('/:templateId/apply', async (req, res) => {
  try {
    const { templateId } = req.params;

    console.log(`Applying template ${templateId} to document:`, JSON.stringify(req.body, null, 2));

    // Get the template
    const template = await templateService.getTemplateById(templateId);
    await templateService.incrementUsageCount(templateId);
    
    // Simple template application logic (can be extended for more complex scenarios)
    const document = req.body.document || {};
    
    // Apply template sections to document
    if (template.content && template.content.sections) {
      document.sections = document.sections || [];
      
      // For each template section
      template.content.sections.forEach(templateSection => {
        // Check if section already exists in document
        const existingSection = document.sections.find(
          s => s.id === templateSection.id || s.title === templateSection.title
        );
        
        if (existingSection) {
          // Update existing section
          Object.assign(existingSection, {
            ...templateSection,
            ...existingSection,
            appliedFromTemplate: templateId
          });
        } else {
          // Add new section
          document.sections.push({
            ...templateSection,
            appliedFromTemplate: templateId
          });
        }
      });
    }
    
    // Apply template metadata
    document.metadata = {
      ...document.metadata,
      appliedTemplate: {
        id: template.id,
        name: template.name,
        appliedAt: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      document,
      template: {
        id: template.id,
        name: template.name
      },
      message: `Template ${template.name} applied successfully`
    });
  } catch (error) {
    console.error(`Error applying template ${req.params.templateId}:`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to apply template'
    });
  }
});

// Get template version history
router.get('/:templateId/versions', async (req, res) => {
  try {
    const versions = await templateService.getTemplateVersions(req.params.templateId);
    res.json({ success: true, versions });
  } catch (error) {
    console.error('Error retrieving template versions:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve versions' });
  }
});

// Roll back to a specific version
router.post('/:templateId/rollback/:versionId', async (req, res) => {
  try {
    const template = await templateService.rollbackTemplate(req.params.templateId, req.params.versionId);
    res.json({ success: true, template, message: 'Template rolled back successfully' });
  } catch (error) {
    console.error('Error rolling back template:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to roll back template' });
  }
});

export default router;