/**
 * Workflow Service
 * 
 * This service provides functionality for managing document workflows,
 * including templates, approvals, and workflow tracking.
 */

import { db } from '../db/connection';
import { sql } from 'drizzle-orm';

export class WorkflowService {
  /**
   * Get workflow templates for a module
   * 
   * @param {string} moduleType Module type
   * @param {number} organizationId Organization ID
   * @returns {Promise<Array>} List of workflow templates
   */
  async getTemplates(moduleType, organizationId) {
    try {
      const templates = await db.execute(
        sql`SELECT t.*, 
               (SELECT JSON_AGG(s.*) 
                FROM workflow_template_steps s 
                WHERE s.template_id = t.id 
                ORDER BY s.step_order) as steps
            FROM workflow_templates t
            WHERE t.module_type = ${moduleType}
            AND t.organization_id = ${organizationId}
            ORDER BY t.created_at DESC`
      );
      
      return templates;
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error;
    }
  }
  
  /**
   * Create default templates for a module
   * 
   * @param {string} moduleType Module type
   * @param {number} organizationId Organization ID
   * @param {number} userId User ID
   * @returns {Promise<Array>} Created templates
   */
  async createDefaultTemplates(moduleType, organizationId, userId) {
    try {
      // Check if templates already exist
      const existingTemplates = await this.getTemplates(moduleType, organizationId);
      
      if (existingTemplates.length > 0) {
        return existingTemplates;
      }
      
      // Create templates based on module type
      let templates = [];
      
      if (moduleType === '510k') {
        templates = await this.create510kTemplates(organizationId, userId);
      } else if (moduleType === 'cer') {
        templates = await this.createCERTemplates(organizationId, userId);
      } else if (moduleType === 'csr') {
        templates = await this.createCSRTemplates(organizationId, userId);
      } else {
        // Default simple approval template
        templates = await this.createSimpleTemplate(moduleType, organizationId, userId);
      }
      
      return templates;
    } catch (error) {
      console.error('Error in createDefaultTemplates:', error);
      throw error;
    }
  }
  
  /**
   * Create a simple approval template
   * 
   * @param {string} moduleType Module type
   * @param {number} organizationId Organization ID
   * @param {number} userId User ID
   * @returns {Promise<Array>} Created template
   */
  private async createSimpleTemplate(moduleType, organizationId, userId) {
    return await db.transaction(async (tx) => {
      // Create template
      const [template] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES ('Basic Approval', 'Simple approval workflow with a single reviewer', 
                 ${moduleType}, ${organizationId}, ${userId}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create step
      await tx.execute(
        sql`INSERT INTO workflow_template_steps
          (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
          VALUES (${template.id}, 'Review', 'Review and approve document', 1, 'reviewer', NOW(), NOW())`
      );
      
      // Return template with steps
      const [resultTemplate] = await tx.execute(
        sql`SELECT t.*, 
              (SELECT JSON_AGG(s.*) 
               FROM workflow_template_steps s 
               WHERE s.template_id = t.id 
               ORDER BY s.step_order) as steps
           FROM workflow_templates t
           WHERE t.id = ${template.id}`
      );
      
      return [resultTemplate];
    });
  }
  
  /**
   * Create 510(k) templates
   * 
   * @param {number} organizationId Organization ID
   * @param {number} userId User ID
   * @returns {Promise<Array>} Created templates
   */
  private async create510kTemplates(organizationId, userId) {
    return await db.transaction(async (tx) => {
      // Create template
      const [template] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES ('510(k) Submission Review', 'FDA 510(k) submission workflow with multiple approval steps', 
                 '510k', ${organizationId}, ${userId}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create steps
      await tx.execute(
        sql`INSERT INTO workflow_template_steps
          (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
          VALUES 
          (${template.id}, 'Technical Review', 'Technical content review by engineering team', 1, 'technical_reviewer', NOW(), NOW()),
          (${template.id}, 'Regulatory Review', 'Regulatory compliance review', 2, 'regulatory_reviewer', NOW(), NOW()),
          (${template.id}, 'QA Approval', 'Quality assurance final approval', 3, 'qa_approver', NOW(), NOW()),
          (${template.id}, 'Management Sign-off', 'Executive management sign-off', 4, 'management', NOW(), NOW())`
      );
      
      // Create simplified template
      const [simpleTemplate] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES ('Quick 510(k) Review', 'Simplified 510(k) review for minor updates', 
                 '510k', ${organizationId}, ${userId}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create steps for simplified template
      await tx.execute(
        sql`INSERT INTO workflow_template_steps
          (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
          VALUES 
          (${simpleTemplate.id}, 'Technical Review', 'Technical content review', 1, 'technical_reviewer', NOW(), NOW()),
          (${simpleTemplate.id}, 'Regulatory Approval', 'Regulatory compliance approval', 2, 'regulatory_reviewer', NOW(), NOW())`
      );
      
      // Return templates with steps
      const templates = await tx.execute(
        sql`SELECT t.*, 
              (SELECT JSON_AGG(s.*) 
               FROM workflow_template_steps s 
               WHERE s.template_id = t.id 
               ORDER BY s.step_order) as steps
           FROM workflow_templates t
           WHERE t.id IN (${template.id}, ${simpleTemplate.id})
           ORDER BY t.created_at DESC`
      );
      
      return templates;
    });
  }
  
  /**
   * Create CER templates
   * 
   * @param {number} organizationId Organization ID
   * @param {number} userId User ID
   * @returns {Promise<Array>} Created templates
   */
  private async createCERTemplates(organizationId, userId) {
    return await db.transaction(async (tx) => {
      // Create template
      const [template] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES ('CER MDR Review', 'Clinical Evaluation Report review for EU MDR compliance', 
                 'cer', ${organizationId}, ${userId}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create steps
      await tx.execute(
        sql`INSERT INTO workflow_template_steps
          (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
          VALUES 
          (${template.id}, 'Clinical Review', 'Review by clinical specialist', 1, 'clinical_reviewer', NOW(), NOW()),
          (${template.id}, 'Literature Review', 'Review of literature section by specialist', 2, 'literature_reviewer', NOW(), NOW()),
          (${template.id}, 'PMS Data Review', 'Review of PMS/PMCF data', 3, 'pms_reviewer', NOW(), NOW()),
          (${template.id}, 'Regulatory Review', 'Regulatory compliance review', 4, 'regulatory_reviewer', NOW(), NOW()),
          (${template.id}, 'QA Approval', 'Quality assurance final approval', 5, 'qa_approver', NOW(), NOW())`
      );
      
      // Return templates with steps
      const [resultTemplate] = await tx.execute(
        sql`SELECT t.*, 
              (SELECT JSON_AGG(s.*) 
               FROM workflow_template_steps s 
               WHERE s.template_id = t.id 
               ORDER BY s.step_order) as steps
           FROM workflow_templates t
           WHERE t.id = ${template.id}`
      );
      
      return [resultTemplate];
    });
  }
  
  /**
   * Create CSR templates
   * 
   * @param {number} organizationId Organization ID
   * @param {number} userId User ID
   * @returns {Promise<Array>} Created templates
   */
  private async createCSRTemplates(organizationId, userId) {
    return await db.transaction(async (tx) => {
      // Create template
      const [template] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES ('Clinical Study Report Review', 'Standard CSR review workflow', 
                 'csr', ${organizationId}, ${userId}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create steps
      await tx.execute(
        sql`INSERT INTO workflow_template_steps
          (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
          VALUES 
          (${template.id}, 'Medical Review', 'Review by medical specialist', 1, 'medical_reviewer', NOW(), NOW()),
          (${template.id}, 'Statistical Review', 'Review of statistical analysis', 2, 'statistical_reviewer', NOW(), NOW()),
          (${template.id}, 'Scientific Review', 'Scientific validity review', 3, 'scientific_reviewer', NOW(), NOW()),
          (${template.id}, 'Regulatory Review', 'Regulatory compliance review', 4, 'regulatory_reviewer', NOW(), NOW()),
          (${template.id}, 'QA Approval', 'Quality assurance final approval', 5, 'qa_approver', NOW(), NOW())`
      );
      
      // Return templates with steps
      const [resultTemplate] = await tx.execute(
        sql`SELECT t.*, 
              (SELECT JSON_AGG(s.*) 
               FROM workflow_template_steps s 
               WHERE s.template_id = t.id 
               ORDER BY s.step_order) as steps
           FROM workflow_templates t
           WHERE t.id = ${template.id}`
      );
      
      return [resultTemplate];
    });
  }
  
  /**
   * Create a workflow template
   * 
   * @param {Object} templateData Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    const {
      name,
      description,
      moduleType,
      organizationId,
      createdBy,
      steps = []
    } = templateData;
    
    return await db.transaction(async (tx) => {
      // Create template
      const [template] = await tx.execute(
        sql`INSERT INTO workflow_templates
          (name, description, module_type, organization_id, created_by, created_at, updated_at)
          VALUES (${name}, ${description}, ${moduleType}, ${organizationId}, ${createdBy}, NOW(), NOW())
          RETURNING *`
      );
      
      // Create steps if provided
      if (steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          await tx.execute(
            sql`INSERT INTO workflow_template_steps
              (template_id, step_name, step_description, step_order, approval_role, created_at, updated_at)
              VALUES (${template.id}, ${step.stepName}, ${step.stepDescription}, ${i + 1}, ${step.approvalRole}, NOW(), NOW())`
          );
        }
      }
      
      // Return template with steps
      const [resultTemplate] = await tx.execute(
        sql`SELECT t.*, 
              (SELECT JSON_AGG(s.*) 
               FROM workflow_template_steps s 
               WHERE s.template_id = t.id 
               ORDER BY s.step_order) as steps
           FROM workflow_templates t
           WHERE t.id = ${template.id}`
      );
      
      return resultTemplate;
    });
  }
  
  /**
   * Get document workflows
   * 
   * @param {number} documentId Document ID
   * @returns {Promise<Array>} List of workflows with approval steps
   */
  async getDocumentWorkflows(documentId) {
    try {
      const workflows = await db.execute(
        sql`SELECT w.*
            FROM document_workflows w
            WHERE w.document_id = ${documentId}
            ORDER BY w.created_at DESC`
      );
      
      // For each workflow, get its approvals
      for (const workflow of workflows) {
        const approvals = await db.execute(
          sql`SELECT a.*, s.step_name, s.step_description, s.step_order, s.approval_role
              FROM workflow_approvals a
              JOIN workflow_template_steps s ON a.step_id = s.id
              WHERE a.workflow_id = ${workflow.id}
              ORDER BY s.step_order`
        );
        
        workflow.approvals = approvals;
      }
      
      return workflows;
    } catch (error) {
      console.error('Error in getDocumentWorkflows:', error);
      throw error;
    }
  }
  
  /**
   * Get active workflows by organization
   * 
   * @param {number} organizationId Organization ID
   * @returns {Promise<Array>} Active workflows
   */
  async getActiveWorkflowsByOrganization(organizationId) {
    try {
      const workflows = await db.execute(
        sql`SELECT w.*
            FROM document_workflows w
            JOIN unified_documents d ON w.document_id = d.id
            WHERE d.organization_id = ${organizationId}
            AND w.status = 'active'
            ORDER BY w.updated_at DESC`
      );
      
      // For each workflow, get its approvals
      for (const workflow of workflows) {
        const approvals = await db.execute(
          sql`SELECT a.*, s.step_name, s.step_description, s.step_order, s.approval_role
              FROM workflow_approvals a
              JOIN workflow_template_steps s ON a.step_id = s.id
              WHERE a.workflow_id = ${workflow.id}
              ORDER BY s.step_order`
        );
        
        workflow.approvals = approvals;
      }
      
      return workflows;
    } catch (error) {
      console.error('Error in getActiveWorkflowsByOrganization:', error);
      throw error;
    }
  }
  
  /**
   * Create a workflow for a document
   * 
   * @param {number} documentId Document ID
   * @param {number} templateId Template ID
   * @param {number} startedBy User ID
   * @param {Object} metadata Optional metadata
   * @returns {Promise<Object>} Created workflow
   */
  async createWorkflow(documentId, templateId, startedBy, metadata = {}) {
    return await db.transaction(async (tx) => {
      // Get template and steps
      const [template] = await tx.execute(
        sql`SELECT t.*
            FROM workflow_templates t
            WHERE t.id = ${templateId}`
      );
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      const steps = await tx.execute(
        sql`SELECT s.*
            FROM workflow_template_steps s
            WHERE s.template_id = ${templateId}
            ORDER BY s.step_order`
      );
      
      if (steps.length === 0) {
        throw new Error('Template has no steps');
      }
      
      // Create workflow
      const [workflow] = await tx.execute(
        sql`INSERT INTO document_workflows
            (document_id, template_id, started_by, status, metadata, created_at, updated_at)
            VALUES (${documentId}, ${templateId}, ${startedBy}, 'active', ${JSON.stringify(metadata)}, NOW(), NOW())
            RETURNING *`
      );
      
      // Add approval entries for each step
      const approvals = [];
      for (const step of steps) {
        const [approval] = await tx.execute(
          sql`INSERT INTO workflow_approvals
              (workflow_id, step_id, status, created_at, updated_at)
              VALUES (${workflow.id}, ${step.id}, 'pending', NOW(), NOW())
              RETURNING *`
        );
        
        // Add step information to approval
        approval.step_name = step.step_name;
        approval.step_description = step.step_description;
        approval.step_order = step.step_order;
        approval.approval_role = step.approval_role;
        
        approvals.push(approval);
      }
      
      // Update document status
      await tx.execute(
        sql`UPDATE unified_documents
            SET status = 'in_review', updated_at = NOW()
            WHERE id = ${documentId}`
      );
      
      // Return workflow with approvals
      workflow.approvals = approvals;
      workflow.name = template.name;
      
      return workflow;
    });
  }
  
  /**
   * Approve a workflow step
   * 
   * @param {number} approvalId Approval ID
   * @param {number} userId User ID
   * @param {string} comments Optional comments
   * @returns {Promise<Object>} Updated workflow
   */
  async approveStep(approvalId, userId, comments = '') {
    return await db.transaction(async (tx) => {
      // Update approval status
      const [approval] = await tx.execute(
        sql`UPDATE workflow_approvals
            SET status = 'approved', 
                approved_by = ${userId}, 
                approved_at = NOW(), 
                comments = ${comments}, 
                updated_at = NOW()
            WHERE id = ${approvalId}
            RETURNING *`
      );
      
      if (!approval) {
        throw new Error('Approval not found');
      }
      
      // Get workflow
      const [workflow] = await tx.execute(
        sql`SELECT * FROM document_workflows WHERE id = ${approval.workflow_id}`
      );
      
      // Check if this was the last step
      const [pendingCount] = await tx.execute(
        sql`SELECT COUNT(*) as count
            FROM workflow_approvals
            WHERE workflow_id = ${workflow.id} AND status = 'pending'`
      );
      
      // If no more pending approvals, mark workflow as completed
      if (pendingCount.count === '0') {
        await tx.execute(
          sql`UPDATE document_workflows
              SET status = 'completed', completed_at = NOW(), updated_at = NOW()
              WHERE id = ${workflow.id}`
        );
        
        // Update document status
        await tx.execute(
          sql`UPDATE unified_documents
              SET status = 'approved', updated_at = NOW()
              WHERE id = ${workflow.document_id}`
        );
      }
      
      // Get updated workflow with approvals
      const [updatedWorkflow] = await tx.execute(
        sql`SELECT w.*
            FROM document_workflows w
            WHERE w.id = ${workflow.id}`
      );
      
      const approvals = await tx.execute(
        sql`SELECT a.*, s.step_name, s.step_description, s.step_order, s.approval_role
            FROM workflow_approvals a
            JOIN workflow_template_steps s ON a.step_id = s.id
            WHERE a.workflow_id = ${workflow.id}
            ORDER BY s.step_order`
      );
      
      updatedWorkflow.approvals = approvals;
      
      return updatedWorkflow;
    });
  }
  
  /**
   * Reject a workflow step
   * 
   * @param {number} approvalId Approval ID
   * @param {number} userId User ID
   * @param {string} comments Required comments
   * @returns {Promise<Object>} Updated workflow
   */
  async rejectStep(approvalId, userId, comments) {
    if (!comments || comments.trim() === '') {
      throw new Error('Comments are required for rejection');
    }
    
    return await db.transaction(async (tx) => {
      // Update approval status
      const [approval] = await tx.execute(
        sql`UPDATE workflow_approvals
            SET status = 'rejected', 
                rejected_by = ${userId}, 
                rejected_at = NOW(), 
                comments = ${comments}, 
                updated_at = NOW()
            WHERE id = ${approvalId}
            RETURNING *`
      );
      
      if (!approval) {
        throw new Error('Approval not found');
      }
      
      // Get workflow
      const [workflow] = await tx.execute(
        sql`SELECT * FROM document_workflows WHERE id = ${approval.workflow_id}`
      );
      
      // Mark workflow as rejected
      await tx.execute(
        sql`UPDATE document_workflows
            SET status = 'rejected', rejected_at = NOW(), updated_at = NOW()
            WHERE id = ${workflow.id}`
      );
      
      // Update document status
      await tx.execute(
        sql`UPDATE unified_documents
            SET status = 'rejected', updated_at = NOW()
            WHERE id = ${workflow.document_id}`
      );
      
      // Get updated workflow with approvals
      const [updatedWorkflow] = await tx.execute(
        sql`SELECT w.*
            FROM document_workflows w
            WHERE w.id = ${workflow.id}`
      );
      
      const approvals = await tx.execute(
        sql`SELECT a.*, s.step_name, s.step_description, s.step_order, s.approval_role
            FROM workflow_approvals a
            JOIN workflow_template_steps s ON a.step_id = s.id
            WHERE a.workflow_id = ${workflow.id}
            ORDER BY s.step_order`
      );
      
      updatedWorkflow.approvals = approvals;
      
      return updatedWorkflow;
    });
  }
}