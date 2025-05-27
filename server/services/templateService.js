const { pool } = require('../database');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger').createLogger('template-service');

/**
 * Template Service
 * 
 * Handles CRUD operations for document templates, supporting both database storage
 * and file-based operations for template uploads.
 */
class TemplateService {
  /**
   * Retrieve all templates based on optional filters
   * @param {Object} filters - Optional filtering criteria
   * @returns {Promise<Array>} - List of templates
   */
  async getAllTemplates(filters = {}) {
    try {
      let queryParams = [];
      let whereClause = '';
      
      // Build the WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const conditions = [];
        let paramIndex = 1;
        
        if (filters.module) {
          conditions.push(`module = $${paramIndex++}`);
          queryParams.push(filters.module);
        }
        
        if (filters.sectionId) {
          conditions.push(`section_id = $${paramIndex++}`);
          queryParams.push(filters.sectionId);
        }
        
        if (filters.status) {
          conditions.push(`status = $${paramIndex++}`);
          queryParams.push(filters.status);
        }
        
        if (filters.searchText) {
          conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
          queryParams.push(`%${filters.searchText}%`);
          paramIndex++;
        }
        
        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      const query = `
        SELECT * FROM document_templates 
        ${whereClause}
        ORDER BY module, section_id
      `;
      
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      logger.error('Error retrieving templates:', error);
      throw new Error('Failed to retrieve templates');
    }
  }
  
  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} - Template object
   */
  async getTemplateById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM document_templates WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Error retrieving template ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(templateData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `INSERT INTO document_templates
          (title, module, section_id, description, guidance, required, 
           status, sections, content, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [
          templateData.title,
          templateData.module,
          templateData.sectionId,
          templateData.description,
          templateData.guidance || '',
          templateData.required || false,
          templateData.status || 'active',
          JSON.stringify(templateData.sections || []),
          templateData.content || ''
        ]
      );
      
      // If there's an uploaded file, process it
      if (templateData.fileContent) {
        const template = result.rows[0];
        const fileId = `template_${template.id}`;
        
        // Store the file content
        await this._storeTemplateFile(fileId, templateData.fileContent);
        
        // Update the template with the file reference
        await client.query(
          `UPDATE document_templates 
           SET file_reference = $1, updated_at = NOW()
           WHERE id = $2`,
          [fileId, template.id]
        );
        
        // Get the updated template
        const updatedResult = await client.query(
          'SELECT * FROM document_templates WHERE id = $1',
          [template.id]
        );
        
        await client.query('COMMIT');
        return updatedResult.rows[0];
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating template:', error);
      throw new Error('Failed to create template');
    } finally {
      client.release();
    }
  }
  
  /**
   * Update an existing template
   * @param {string} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<Object>} - Updated template
   */
  async updateTemplate(id, templateData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if template exists
      const checkResult = await client.query(
        'SELECT * FROM document_templates WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw new Error('Template not found');
      }

      // Save current version
      const nextVerRes = await client.query(
        'SELECT COALESCE(MAX(version),0) + 1 AS v FROM template_versions WHERE template_id = $1',
        [id]
      );
      const nextVersion = nextVerRes.rows[0].v;
      await client.query(
        'INSERT INTO template_versions (template_id, version, data) VALUES ($1, $2, $3)',
        [id, nextVersion, checkResult.rows[0]]
      );
      
      // Build the SET clause dynamically based on provided data
      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;
      
      if (templateData.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        queryParams.push(templateData.title);
      }
      
      if (templateData.module !== undefined) {
        updateFields.push(`module = $${paramIndex++}`);
        queryParams.push(templateData.module);
      }
      
      if (templateData.sectionId !== undefined) {
        updateFields.push(`section_id = $${paramIndex++}`);
        queryParams.push(templateData.sectionId);
      }
      
      if (templateData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        queryParams.push(templateData.description);
      }
      
      if (templateData.guidance !== undefined) {
        updateFields.push(`guidance = $${paramIndex++}`);
        queryParams.push(templateData.guidance);
      }
      
      if (templateData.required !== undefined) {
        updateFields.push(`required = $${paramIndex++}`);
        queryParams.push(templateData.required);
      }
      
      if (templateData.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        queryParams.push(templateData.status);
      }
      
      if (templateData.sections !== undefined) {
        updateFields.push(`sections = $${paramIndex++}`);
        queryParams.push(JSON.stringify(templateData.sections));
      }
      
      if (templateData.content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        queryParams.push(templateData.content);
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);
      
      // Add the template ID as the last parameter
      queryParams.push(id);
      
      // Execute the update
      const result = await client.query(
        `UPDATE document_templates 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        queryParams
      );
      
      // If there's an uploaded file, process it
      if (templateData.fileContent) {
        const template = result.rows[0];
        const fileId = `template_${template.id}`;
        
        // Store the file content
        await this._storeTemplateFile(fileId, templateData.fileContent);
        
        // Update the template with the file reference
        await client.query(
          `UPDATE document_templates 
           SET file_reference = $1, updated_at = NOW()
           WHERE id = $2`,
          [fileId, template.id]
        );
        
        // Get the updated template
        const updatedResult = await client.query(
          'SELECT * FROM document_templates WHERE id = $1',
          [template.id]
        );
        
        await client.query('COMMIT');
        return updatedResult.rows[0];
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error updating template ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete a template by ID
   * @param {string} id - Template ID
   * @returns {Promise<boolean>} - Success indicator
   */
  async deleteTemplate(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the template first to check if it exists and has a file
      const getResult = await client.query(
        'SELECT * FROM document_templates WHERE id = $1',
        [id]
      );
      
      if (getResult.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      const template = getResult.rows[0];
      
      // Delete the template
      await client.query(
        'DELETE FROM document_templates WHERE id = $1',
        [id]
      );
      
      // If there's a file associated with the template, delete it
      if (template.file_reference) {
        await this._deleteTemplateFile(template.file_reference);
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error deleting template ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Upload and associate a file with a template
   * @param {string} templateId - Template ID
   * @param {Buffer|string} fileContent - File content
   * @param {string} fileName - Original file name
   * @returns {Promise<Object>} - Updated template
   */
  async uploadTemplateFile(templateId, fileContent, fileName) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if template exists
      const checkResult = await client.query(
        'SELECT * FROM document_templates WHERE id = $1',
        [templateId]
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      const fileId = `template_${templateId}`;
      
      // Store the file
      await this._storeTemplateFile(fileId, fileContent);
      
      // Update the template with the file reference and original filename
      const result = await client.query(
        `UPDATE document_templates 
         SET file_reference = $1, original_filename = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [fileId, fileName, templateId]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error uploading file for template ${templateId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get template file content
   * @param {string} templateId - Template ID
   * @returns {Promise<{content: Buffer, fileName: string}>} - File content and name
   */
  async getTemplateFile(templateId) {
    try {
      // Get the template
      const result = await pool.query(
        'SELECT * FROM document_templates WHERE id = $1',
        [templateId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      const template = result.rows[0];
      
      if (!template.file_reference) {
        throw new Error('Template has no associated file');
      }
      
      // Get the file content
      const content = await this._retrieveTemplateFile(template.file_reference);
      
      return {
        content,
        fileName: template.original_filename || `template_${templateId}.docx`
      };
    } catch (error) {
      logger.error(`Error retrieving file for template ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Store a template file
   * @param {string} fileId - Unique identifier for the file
   * @param {Buffer|string} content - File content
   * @returns {Promise<void>}
   */
  async _storeTemplateFile(fileId, content) {
    try {
      const templateDir = path.join(__dirname, '../../templates');
      
      // Ensure the directory exists
      await fs.mkdir(templateDir, { recursive: true });
      
      // Write the file
      await fs.writeFile(
        path.join(templateDir, `${fileId}.docx`),
        content
      );
    } catch (error) {
      logger.error(`Error storing template file ${fileId}:`, error);
      throw new Error('Failed to store template file');
    }
  }
  
  /**
   * Retrieve a template file
   * @param {string} fileId - File identifier
   * @returns {Promise<Buffer>} - File content
   */
  async _retrieveTemplateFile(fileId) {
    try {
      const filePath = path.join(__dirname, '../../templates', `${fileId}.docx`);
      return await fs.readFile(filePath);
    } catch (error) {
      logger.error(`Error retrieving template file ${fileId}:`, error);
      throw new Error('Failed to retrieve template file');
    }
  }
  
  /**
   * Delete a template file
   * @param {string} fileId - File identifier
   * @returns {Promise<void>}
   */
  async _deleteTemplateFile(fileId) {
    try {
      const filePath = path.join(__dirname, '../../templates', `${fileId}.docx`);
      await fs.unlink(filePath);
    } catch (error) {
      logger.error(`Error deleting template file ${fileId}:`, error);
      throw new Error('Failed to delete template file');
    }
  }

  /**
   * Increment usage count for a template
   * @param {string|number} templateId - Template ID
   * @returns {Promise<void>}
   */
  async incrementUsageCount(templateId) {
    try {
      await pool.query(
        'UPDATE document_templates SET usage_count = COALESCE(usage_count,0) + 1 WHERE id = $1',
        [templateId]
      );
    } catch (error) {
      logger.error(`Error incrementing usage for template ${templateId}:`, error);
    }
  }

  /**
   * Get version history for a template
   * @param {string|number} templateId
   * @returns {Promise<Array>}
   */
  async getTemplateVersions(templateId) {
    const result = await pool.query(
      'SELECT * FROM template_versions WHERE template_id = $1 ORDER BY version DESC',
      [templateId]
    );
    return result.rows;
  }

  /**
   * Roll back a template to a specific version
   * @param {string|number} templateId
   * @param {string|number} versionId
   * @returns {Promise<Object>} - Updated template
   */
  async rollbackTemplate(templateId, versionId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const versionRes = await client.query(
        'SELECT * FROM template_versions WHERE id = $1 AND template_id = $2',
        [versionId, templateId]
      );

      if (versionRes.rows.length === 0) {
        throw new Error('Version not found');
      }

      const data = versionRes.rows[0].data || {};

      const result = await client.query(
        `UPDATE document_templates
         SET title = $1,
             module = $2,
             section_id = $3,
             description = $4,
             guidance = $5,
             required = $6,
             status = $7,
             sections = $8,
             content = $9,
             updated_at = NOW()
         WHERE id = $10
         RETURNING *`,
        [
          data.title,
          data.module,
          data.section_id,
          data.description,
          data.guidance,
          data.required,
          data.status,
          JSON.stringify(data.sections || []),
          data.content,
          templateId
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error rolling back template ${templateId} to version ${versionId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Import templates in bulk from a data source
   * @param {Array} templates - Array of template objects
   * @returns {Promise<{inserted: number, errors: Array}>} - Result statistics
   */
  async importTemplates(templates) {
    const client = await pool.connect();
    const results = { inserted: 0, errors: [] };
    
    try {
      await client.query('BEGIN');
      
      for (const template of templates) {
        try {
          // Check if template already exists by module and section_id
          const checkResult = await client.query(
            'SELECT * FROM document_templates WHERE module = $1 AND section_id = $2',
            [template.module, template.sectionId]
          );
          
          // If template exists, update it
          if (checkResult.rows.length > 0) {
            await client.query(
              `UPDATE document_templates 
               SET title = $1, 
                   description = $2, 
                   guidance = $3, 
                   required = $4, 
                   status = $5, 
                   sections = $6,
                   content = $7,
                   updated_at = NOW()
               WHERE id = $8`,
              [
                template.title,
                template.description,
                template.guidance || '',
                template.required || false,
                template.status || 'active',
                JSON.stringify(template.sections || []),
                template.content || '',
                checkResult.rows[0].id
              ]
            );
          } else {
            // Insert new template
            await client.query(
              `INSERT INTO document_templates
                (title, module, section_id, description, guidance, required, 
                 status, sections, content, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
              [
                template.title,
                template.module,
                template.sectionId,
                template.description,
                template.guidance || '',
                template.required || false,
                template.status || 'active',
                JSON.stringify(template.sections || []),
                template.content || ''
              ]
            );
          }
          
          results.inserted++;
        } catch (error) {
          results.errors.push({
            template: `${template.module}-${template.sectionId}`,
            error: error.message
          });
          logger.error(`Error importing template ${template.module}-${template.sectionId}:`, error);
        }
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error importing templates:', error);
      throw new Error('Failed to import templates');
    } finally {
      client.release();
    }
  }
}

module.exports = new TemplateService();