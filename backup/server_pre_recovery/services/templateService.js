/**
 * Template Service - Provides functionality for managing document templates
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set templates directory
const templatesDir = path.join(__dirname, '../../templates');

/**
 * Get all available templates with metadata
 * 
 * @returns {Promise<Array>} List of templates with metadata
 */
export const getAllTemplates = async () => {
  try {
    // Create templates directory if it doesn't exist
    try {
      await fs.access(templatesDir);
    } catch (e) {
      await fs.mkdir(templatesDir, { recursive: true });
    }
    
    // Read template files from directory
    const files = await fs.readdir(templatesDir);
    const templateFiles = files.filter(file => 
      file.endsWith('.json') || file.endsWith('.template.json')
    );
    
    // Read metadata from each template file
    const templates = await Promise.all(templateFiles.map(async (file) => {
      try {
        const filePath = path.join(templatesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const templateData = JSON.parse(content);
        
        return {
          id: path.basename(file, path.extname(file)),
          name: templateData.name || path.basename(file, path.extname(file)),
          description: templateData.description || 'No description provided',
          category: templateData.category || 'Uncategorized',
          tags: templateData.tags || [],
          sections: templateData.sections || [],
          createdAt: templateData.createdAt || new Date().toISOString(),
          updatedAt: templateData.updatedAt || new Date().toISOString(),
          author: templateData.author || 'System',
          version: templateData.version || '1.0',
          regulatoryRegion: templateData.regulatoryRegion || 'Global',
          submissionType: templateData.submissionType || 'Any',
          filePath
        };
      } catch (err) {
        console.error(`Error reading template file ${file}:`, err);
        return null;
      }
    }));
    
    // Filter out any nulls from errors
    return templates.filter(Boolean);
  } catch (err) {
    console.error('Error getting templates:', err);
    throw err;
  }
};

/**
 * Get a template by ID
 * 
 * @param {string} templateId - ID of the template to retrieve
 * @returns {Promise<Object>} Template data
 */
export const getTemplateById = async (templateId) => {
  try {
    const templates = await getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Read full template content
    const content = await fs.readFile(template.filePath, 'utf8');
    const fullTemplate = JSON.parse(content);
    
    return {
      ...template,
      content: fullTemplate
    };
  } catch (err) {
    console.error(`Error getting template ${templateId}:`, err);
    throw err;
  }
};

/**
 * Save a new template
 * 
 * @param {Object} templateData - Template data to save
 * @returns {Promise<Object>} Saved template data
 */
export const saveTemplate = async (templateData) => {
  try {
    if (!templateData.name) {
      throw new Error('Template name is required');
    }
    
    // Generate ID from name if not provided
    const templateId = templateData.id || 
      templateData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Add timestamps
    const now = new Date().toISOString();
    const template = {
      ...templateData,
      id: templateId,
      createdAt: now,
      updatedAt: now
    };
    
    // Create templates directory if it doesn't exist
    try {
      await fs.access(templatesDir);
    } catch (e) {
      await fs.mkdir(templatesDir, { recursive: true });
    }
    
    // Save template to file
    const filePath = path.join(templatesDir, `${templateId}.template.json`);
    await fs.writeFile(filePath, JSON.stringify(template, null, 2), 'utf8');
    
    // Add file path for reference
    return {
      ...template,
      filePath
    };
  } catch (err) {
    console.error('Error saving template:', err);
    throw err;
  }
};

/**
 * Update an existing template
 * 
 * @param {string} templateId - ID of the template to update
 * @param {Object} templateData - Updated template data
 * @returns {Promise<Object>} Updated template data
 */
export const updateTemplate = async (templateId, templateData) => {
  try {
    // Check if template exists
    const templates = await getAllTemplates();
    const existingTemplate = templates.find(t => t.id === templateId);
    
    if (!existingTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Update template
    const now = new Date().toISOString();
    const updatedTemplate = {
      ...existingTemplate.content,
      ...templateData,
      id: templateId,
      updatedAt: now
    };
    
    // Save updated template
    await fs.writeFile(
      existingTemplate.filePath,
      JSON.stringify(updatedTemplate, null, 2),
      'utf8'
    );
    
    return {
      ...updatedTemplate,
      filePath: existingTemplate.filePath
    };
  } catch (err) {
    console.error(`Error updating template ${templateId}:`, err);
    throw err;
  }
};

/**
 * Delete a template
 * 
 * @param {string} templateId - ID of the template to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteTemplate = async (templateId) => {
  try {
    // Check if template exists
    const templates = await getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Delete template file
    await fs.unlink(template.filePath);
    
    return true;
  } catch (err) {
    console.error(`Error deleting template ${templateId}:`, err);
    throw err;
  }
};

/**
 * Get templates by category
 * 
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} List of templates in the category
 */
export const getTemplatesByCategory = async (category) => {
  try {
    const templates = await getAllTemplates();
    return templates.filter(t => t.category === category);
  } catch (err) {
    console.error(`Error getting templates by category ${category}:`, err);
    throw err;
  }
};

/**
 * Search templates by keyword
 * 
 * @param {string} keyword - Keyword to search for
 * @returns {Promise<Array>} List of matching templates
 */
export const searchTemplates = async (keyword) => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return getAllTemplates();
    }
    
    const templates = await getAllTemplates();
    const lowerKeyword = keyword.toLowerCase();
    
    return templates.filter(t => {
      // Search in name, description, tags
      return (
        t.name.toLowerCase().includes(lowerKeyword) ||
        (t.description && t.description.toLowerCase().includes(lowerKeyword)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) ||
        (t.category && t.category.toLowerCase().includes(lowerKeyword)) ||
        (t.regulatoryRegion && t.regulatoryRegion.toLowerCase().includes(lowerKeyword)) ||
        (t.submissionType && t.submissionType.toLowerCase().includes(lowerKeyword))
      );
    });
  } catch (err) {
    console.error(`Error searching templates for "${keyword}":`, err);
    throw err;
  }
};

export default {
  getAllTemplates,
  getTemplateById,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplatesByCategory,
  searchTemplates
};