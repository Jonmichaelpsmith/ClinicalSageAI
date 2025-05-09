/**
 * Tenant Section Gating API Routes
 * 
 * Handles tenant-specific section gating rules based on CTQ factors
 * for enforcing risk-based quality controls.
 */
import { Router } from 'express';
import { z } from 'zod';
import { eq, and, SQL } from 'drizzle-orm';
import { qmpSectionGating, ctqFactors } from '../../shared/schema';
import { authMiddleware } from '../auth';
import { requireTenantMiddleware } from '../middleware/tenantContext';
import { TenantDb } from '../db/tenantDb';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-section-gating-api');
const router = Router();

// Section Gating schema for validation
const sectionGatingSchema = z.object({
  sectionCode: z.string().min(3).max(100),
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  ctqFactors: z.array(z.number()).min(0),
  requiredCtqFactors: z.array(z.number()).min(0),
  warningCtqFactors: z.array(z.number()).min(0),
  informationalCtqFactors: z.array(z.number()).min(0),
  overridePolicy: z.enum(['none', 'admin-only', 'manager-approval', 'document-reason']).default('none'),
  active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

/**
 * Get all section gating rules for a tenant
 */
router.get('/:tenantId/section-gating', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions - need at least viewer access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && 
        req.userRole !== 'manager' && req.userRole !== 'member' && 
        req.userRole !== 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions to view section gating rules' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view section gating rules for your own organization' });
    }
    
    // Optional filtering
    const { sectionCode, active } = req.query;
    
    // Build query with optional filters
    let query = req.db.select().from(qmpSectionGating)
      .where(eq(qmpSectionGating.organizationId, tenantId));
    
    if (sectionCode) {
      query = query.where(eq(qmpSectionGating.sectionCode, sectionCode as string));
    }
    
    if (active !== undefined) {
      const isActive = active === 'true';
      query = query.where(eq(qmpSectionGating.active, isActive));
    }
    
    const gatingRules = await query.orderBy(qmpSectionGating.sectionCode);
    
    // If requested with expanded factors, fetch the factor details
    if (req.query.expanded === 'true') {
      const enhancedRules = await Promise.all(gatingRules.map(async (rule) => {
        const allFactorIds = [
          ...(rule.ctqFactors || []),
          ...(rule.requiredCtqFactors || []),
          ...(rule.warningCtqFactors || []),
          ...(rule.informationalCtqFactors || [])
        ];
        
        if (allFactorIds.length === 0) {
          return {
            ...rule,
            factorDetails: []
          };
        }
        
        // Fetch the details of all factor IDs
        const factors = await req.db.select().from(ctqFactors)
          .where(and(
            eq(ctqFactors.organizationId, tenantId),
            SQL`${ctqFactors.id} IN (${allFactorIds.join(',')})`
          ));
        
        return {
          ...rule,
          factorDetails: factors
        };
      }));
      
      return res.json(enhancedRules);
    }
    
    return res.json(gatingRules);
  } catch (error) {
    logger.error(`Error fetching section gating rules for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to fetch section gating rules' });
  }
});

/**
 * Get a single section gating rule by ID
 */
router.get('/:tenantId/section-gating/:ruleId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const ruleId = parseInt(req.params.ruleId);
    
    if (isNaN(tenantId) || isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or rule ID' });
    }
    
    // Check permissions - need at least viewer access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && 
        req.userRole !== 'manager' && req.userRole !== 'member' && 
        req.userRole !== 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions to view section gating rules' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view section gating rules for your own organization' });
    }
    
    // Get the rule
    const rule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.id, ruleId),
        eq(qmpSectionGating.organizationId, tenantId)
      ))
      .limit(1);
    
    if (rule.length === 0) {
      return res.status(404).json({ error: 'Section gating rule not found' });
    }
    
    // If requested with expanded factors, fetch the factor details
    if (req.query.expanded === 'true') {
      const allFactorIds = [
        ...(rule[0].ctqFactors || []),
        ...(rule[0].requiredCtqFactors || []),
        ...(rule[0].warningCtqFactors || []),
        ...(rule[0].informationalCtqFactors || [])
      ];
      
      if (allFactorIds.length > 0) {
        // Fetch the details of all factor IDs
        const factors = await req.db.select().from(ctqFactors)
          .where(and(
            eq(ctqFactors.organizationId, tenantId),
            SQL`${ctqFactors.id} IN (${allFactorIds.join(',')})`
          ));
        
        return res.json({
          ...rule[0],
          factorDetails: factors
        });
      }
    }
    
    return res.json(rule[0]);
  } catch (error) {
    logger.error(`Error fetching section gating rule ${req.params.ruleId} for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to fetch section gating rule' });
  }
});

/**
 * Create a new section gating rule
 */
router.post('/:tenantId/section-gating', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions - need admin or manager access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions to create section gating rules' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only create section gating rules for your own organization' });
    }
    
    // Validate the request body
    const validationResult = sectionGatingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid section gating rule data', 
        details: validationResult.error.format() 
      });
    }
    
    const ruleData = validationResult.data;
    
    // Check if a rule already exists for this section
    const existingRule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.sectionCode, ruleData.sectionCode),
        eq(qmpSectionGating.organizationId, tenantId)
      ))
      .limit(1);
    
    if (existingRule.length > 0) {
      return res.status(400).json({ 
        error: 'Section gating rule already exists', 
        message: `A rule already exists for section code "${ruleData.sectionCode}". Use PATCH to update it instead.`
      });
    }
    
    // Verify all CTQ factors exist and belong to this tenant
    const allFactorIds = [
      ...(ruleData.ctqFactors || []),
      ...(ruleData.requiredCtqFactors || []),
      ...(ruleData.warningCtqFactors || []),
      ...(ruleData.informationalCtqFactors || [])
    ];
    
    if (allFactorIds.length > 0) {
      const factors = await req.db.select().from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, tenantId),
          SQL`${ctqFactors.id} IN (${allFactorIds.join(',')})`
        ));
      
      if (factors.length !== allFactorIds.length) {
        return res.status(400).json({ 
          error: 'Invalid CTQ factor IDs', 
          message: 'One or more CTQ factor IDs do not exist or do not belong to this tenant'
        });
      }
    }
    
    // Create the section gating rule
    const tenantDb = new TenantDb(tenantId);
    const createdRule = await tenantDb.insert(qmpSectionGating, {
      ...ruleData,
      createdById: req.userId,
      updatedById: req.userId
    });
    
    return res.status(201).json(createdRule[0]);
  } catch (error) {
    logger.error(`Error creating section gating rule for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to create section gating rule' });
  }
});

/**
 * Update a section gating rule
 */
router.patch('/:tenantId/section-gating/:ruleId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const ruleId = parseInt(req.params.ruleId);
    
    if (isNaN(tenantId) || isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or rule ID' });
    }
    
    // Check permissions - need admin or manager access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions to update section gating rules' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only update section gating rules for your own organization' });
    }
    
    // Check if rule exists
    const existingRule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.id, ruleId),
        eq(qmpSectionGating.organizationId, tenantId)
      ))
      .limit(1);
    
    if (existingRule.length === 0) {
      return res.status(404).json({ error: 'Section gating rule not found' });
    }
    
    // Validate the request body
    const validationResult = sectionGatingSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid section gating rule data', 
        details: validationResult.error.format() 
      });
    }
    
    const ruleData = validationResult.data;
    
    // If changing sectionCode, ensure no other rule uses it
    if (ruleData.sectionCode && ruleData.sectionCode !== existingRule[0].sectionCode) {
      const duplicateRule = await req.db.select().from(qmpSectionGating)
        .where(and(
          eq(qmpSectionGating.sectionCode, ruleData.sectionCode),
          eq(qmpSectionGating.organizationId, tenantId),
          SQL`${qmpSectionGating.id} != ${ruleId}`
        ))
        .limit(1);
      
      if (duplicateRule.length > 0) {
        return res.status(400).json({ 
          error: 'Section code already in use', 
          message: `Another rule already uses section code "${ruleData.sectionCode}"`
        });
      }
    }
    
    // Verify all CTQ factors exist and belong to this tenant
    const allFactorIds = [
      ...(ruleData.ctqFactors || []),
      ...(ruleData.requiredCtqFactors || []),
      ...(ruleData.warningCtqFactors || []),
      ...(ruleData.informationalCtqFactors || [])
    ].filter(id => id !== undefined);
    
    if (allFactorIds.length > 0) {
      const factors = await req.db.select().from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, tenantId),
          SQL`${ctqFactors.id} IN (${allFactorIds.join(',')})`
        ));
      
      if (factors.length !== allFactorIds.length) {
        return res.status(400).json({ 
          error: 'Invalid CTQ factor IDs', 
          message: 'One or more CTQ factor IDs do not exist or do not belong to this tenant'
        });
      }
    }
    
    // Update the section gating rule
    const tenantDb = new TenantDb(tenantId);
    const updatedRule = await tenantDb.update(
      qmpSectionGating,
      {
        ...ruleData,
        updatedById: req.userId,
        updatedAt: new Date()
      },
      eq(qmpSectionGating.id, ruleId)
    );
    
    return res.json(updatedRule[0]);
  } catch (error) {
    logger.error(`Error updating section gating rule ${req.params.ruleId} for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to update section gating rule' });
  }
});

/**
 * Delete a section gating rule
 */
router.delete('/:tenantId/section-gating/:ruleId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const ruleId = parseInt(req.params.ruleId);
    
    if (isNaN(tenantId) || isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or rule ID' });
    }
    
    // Check permissions - need admin access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to delete section gating rules' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only delete section gating rules for your own organization' });
    }
    
    // Check if rule exists
    const existingRule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.id, ruleId),
        eq(qmpSectionGating.organizationId, tenantId)
      ))
      .limit(1);
    
    if (existingRule.length === 0) {
      return res.status(404).json({ error: 'Section gating rule not found' });
    }
    
    // Delete the section gating rule
    const tenantDb = new TenantDb(tenantId);
    await tenantDb.delete(qmpSectionGating, eq(qmpSectionGating.id, ruleId));
    
    return res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting section gating rule ${req.params.ruleId} for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to delete section gating rule' });
  }
});

/**
 * Validate a section against gating rules
 */
router.post('/:tenantId/section-gating/validate', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions - any authenticated user can validate sections
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only validate sections for your own organization' });
    }
    
    // Validate the request body
    const validationSchema = z.object({
      sectionCode: z.string().min(1),
      satisfiedFactors: z.array(z.number()).optional(),
      content: z.string().optional(),
      projectId: z.number().optional(),
      documentId: z.number().optional(),
    });
    
    const validationResult = validationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid validation request data', 
        details: validationResult.error.format() 
      });
    }
    
    const { sectionCode, satisfiedFactors = [], content, projectId, documentId } = validationResult.data;
    
    // Get the section gating rule
    const rule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.sectionCode, sectionCode),
        eq(qmpSectionGating.organizationId, tenantId),
        eq(qmpSectionGating.active, true)
      ))
      .limit(1);
    
    if (rule.length === 0) {
      // No gating rule, section is automatically valid
      return res.json({
        valid: true,
        sectionCode,
        hardGate: false,
        softGate: false,
        message: 'No gating rules defined for this section',
        missingFactors: [],
        warningFactors: [],
        informationalFactors: [],
        satisfiedFactors: []
      });
    }
    
    // Get all the required CTQ factors
    const requiredFactors = rule[0].requiredCtqFactors || [];
    const warningFactors = rule[0].warningCtqFactors || [];
    const informationalFactors = rule[0].informationalCtqFactors || [];
    
    // Find missing required factors
    const missingRequiredFactors = requiredFactors.filter(
      factorId => !satisfiedFactors.includes(factorId)
    );
    
    // Find missing warning factors
    const missingWarningFactors = warningFactors.filter(
      factorId => !satisfiedFactors.includes(factorId)
    );
    
    // Find missing informational factors
    const missingInfoFactors = informationalFactors.filter(
      factorId => !satisfiedFactors.includes(factorId)
    );
    
    // If we have content, do additional content-based checks
    if (content) {
      // In a real implementation, you'd use NLP or other techniques
      // to analyze the content for compliance with CTQ factors
      // For now, we'll use a simple check for minimum content length
      if (content.length < 100 && requiredFactors.length > 0) {
        missingRequiredFactors.push(...requiredFactors.filter(
          factorId => !missingRequiredFactors.includes(factorId)
        ));
      }
    }
    
    // Get details of all missing factors if requested
    let missingFactorDetails = [];
    let warningFactorDetails = [];
    let infoFactorDetails = [];
    let satisfiedFactorDetails = [];
    
    if (req.query.detailed === 'true') {
      const allFactorIds = [
        ...missingRequiredFactors,
        ...missingWarningFactors,
        ...missingInfoFactors,
        ...satisfiedFactors
      ];
      
      if (allFactorIds.length > 0) {
        const factors = await req.db.select().from(ctqFactors)
          .where(and(
            eq(ctqFactors.organizationId, tenantId),
            SQL`${ctqFactors.id} IN (${allFactorIds.join(',')})`
          ));
        
        missingFactorDetails = factors.filter(factor => 
          missingRequiredFactors.includes(factor.id)
        );
        
        warningFactorDetails = factors.filter(factor => 
          missingWarningFactors.includes(factor.id)
        );
        
        infoFactorDetails = factors.filter(factor => 
          missingInfoFactors.includes(factor.id)
        );
        
        satisfiedFactorDetails = factors.filter(factor => 
          satisfiedFactors.includes(factor.id)
        );
      }
    }
    
    // Determine validation result
    const hardGate = missingRequiredFactors.length > 0;
    const softGate = missingWarningFactors.length > 0;
    
    let message = 'Section validates successfully';
    
    if (hardGate) {
      message = `Section validation failed - ${missingRequiredFactors.length} required quality factors not satisfied`;
    } else if (softGate) {
      message = `Section has warnings - ${missingWarningFactors.length} quality recommendations not satisfied`;
    } else if (missingInfoFactors.length > 0) {
      message = `Section is valid but ${missingInfoFactors.length} informational quality suggestions not applied`;
    }
    
    // Log validation attempt if tracking is enabled
    if (projectId || documentId) {
      // In a real implementation, you'd log this validation attempt
      // to the database for audit trail purposes
      logger.info(`Section validation for tenant ${tenantId}, section ${sectionCode}`, {
        projectId,
        documentId,
        userId: req.userId,
        result: hardGate ? 'failed' : (softGate ? 'warning' : 'success'),
        missingRequired: missingRequiredFactors.length,
        missingWarnings: missingWarningFactors.length,
        missingInfo: missingInfoFactors.length,
        satisfied: satisfiedFactors.length
      });
    }
    
    return res.json({
      valid: !hardGate,
      sectionCode,
      hardGate,
      softGate,
      message,
      missingFactors: req.query.detailed === 'true' ? missingFactorDetails : missingRequiredFactors,
      warningFactors: req.query.detailed === 'true' ? warningFactorDetails : missingWarningFactors,
      informationalFactors: req.query.detailed === 'true' ? infoFactorDetails : missingInfoFactors,
      satisfiedFactors: req.query.detailed === 'true' ? satisfiedFactorDetails : satisfiedFactors
    });
  } catch (error) {
    logger.error(`Error validating section for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to validate section' });
  }
});

/**
 * Get validation statistics for a project
 */
router.get('/:tenantId/section-gating/project/:projectId/stats', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(tenantId) || isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid tenant ID or project ID' });
    }
    
    // Check permissions - need at least viewer access
    if (req.userRole !== 'super_admin' && req.userRole !== 'admin' && 
        req.userRole !== 'manager' && req.userRole !== 'member' && 
        req.userRole !== 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions to view validation statistics' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only view statistics for your own organization' });
    }
    
    // Verify project exists and belongs to this tenant
    const project = await req.db.execute(`
      SELECT 1 FROM cer_projects 
      WHERE id = $1 AND organization_id = $2 
      LIMIT 1
    `, [projectId, tenantId]);
    
    if (project.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found or does not belong to this tenant' });
    }
    
    // Get all section gating rules
    const rules = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, tenantId),
        eq(qmpSectionGating.active, true)
      ));
    
    // For a real implementation, you'd query the validation history
    // Here, we'll simulate statistics based on the project ID
    const statistics = rules.map(rule => {
      // Simple deterministic "random" based on projectId and rule.id
      const randomSeed = (projectId * 13 + rule.id * 7) % 100;
      
      return {
        sectionCode: rule.sectionCode,
        sectionName: rule.name,
        status: randomSeed < 30 ? 'failed' : (randomSeed < 60 ? 'warning' : 'passed'),
        lastValidated: new Date(Date.now() - (randomSeed * 60000)).toISOString(),
        requiredFactors: rule.requiredCtqFactors?.length || 0,
        warningFactors: rule.warningCtqFactors?.length || 0,
        informationalFactors: rule.informationalCtqFactors?.length || 0,
        satisfiedFactors: Math.floor((rule.requiredCtqFactors?.length || 0) * randomSeed / 100),
        compliancePercentage: randomSeed
      };
    });
    
    return res.json({
      projectId,
      totalSections: rules.length,
      passedSections: statistics.filter(s => s.status === 'passed').length,
      warningSections: statistics.filter(s => s.status === 'warning').length,
      failedSections: statistics.filter(s => s.status === 'failed').length,
      overallCompliancePercentage: statistics.reduce((sum, stat) => sum + stat.compliancePercentage, 0) / Math.max(1, statistics.length),
      sectionStats: statistics
    });
  } catch (error) {
    logger.error(`Error fetching validation statistics for project ${req.params.projectId} in tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to fetch validation statistics' });
  }
});

/**
 * Batch validate multiple sections against gating rules
 * 
 * This endpoint allows validating multiple sections at once,
 * which is useful for checking overall document/project compliance.
 */
router.post('/:tenantId/section-gating/batch-validate', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions - any authenticated user can validate sections
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only validate sections for your own organization' });
    }
    
    // Validate the request body
    const batchValidationSchema = z.object({
      projectId: z.number().optional(),
      documentId: z.number().optional(),
      sections: z.array(z.object({
        sectionCode: z.string().min(1),
        satisfiedFactors: z.array(z.number()).optional(),
        content: z.string().optional()
      })).min(1)
    });
    
    const validationResult = batchValidationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid batch validation request data', 
        details: validationResult.error.format() 
      });
    }
    
    const { sections, projectId, documentId } = validationResult.data;
    
    // Get all active section gating rules for this tenant
    const gatingRules = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, tenantId),
        eq(qmpSectionGating.active, true)
      ));
    
    // Create a map of section codes to rules for efficient lookup
    const sectionRulesMap = new Map();
    gatingRules.forEach(rule => {
      sectionRulesMap.set(rule.sectionCode, rule);
    });
    
    // Get all unique CTQ factor IDs across all sections
    const allFactorIds = new Set<number>();
    gatingRules.forEach(rule => {
      [...(rule.requiredCtqFactors || []), 
       ...(rule.warningCtqFactors || []), 
       ...(rule.informationalCtqFactors || [])]
        .forEach(id => allFactorIds.add(id));
    });
    
    // Fetch all factors if we have any
    let factors: any[] = [];
    if (allFactorIds.size > 0) {
      factors = await req.db.select().from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, tenantId),
          SQL`${ctqFactors.id} IN (${Array.from(allFactorIds).join(',')})`
        ));
    }
    
    // Create a map of factor IDs to factors
    const factorsMap = new Map();
    factors.forEach(factor => {
      factorsMap.set(factor.id, factor);
    });
    
    // Process each section
    const results = sections.map(section => {
      const { sectionCode, satisfiedFactors = [] } = section;
      const rule = sectionRulesMap.get(sectionCode);
      
      // If no rule exists for this section, return a warning
      if (!rule) {
        return {
          sectionCode,
          valid: true, // No rule means no constraints
          status: 'no-rule',
          message: `No gating rule exists for section "${sectionCode}"`,
          compliancePercentage: 100
        };
      }
      
      // Get the factor lists
      const requiredFactorIds = rule.requiredCtqFactors || [];
      const warningFactorIds = rule.warningCtqFactors || [];
      const infoFactorIds = rule.informationalCtqFactors || [];
      
      // Calculate satisfied/missing factors
      const missingSatisfiedFactors = requiredFactorIds.filter(id => !satisfiedFactors.includes(id));
      const missingSatisfiedWarningFactors = warningFactorIds.filter(id => !satisfiedFactors.includes(id));
      const missingSatisfiedInfoFactors = infoFactorIds.filter(id => !satisfiedFactors.includes(id));
      
      // Determine overall validation result
      const hasAllRequiredFactors = requiredFactorIds.length === 0 || 
        missingSatisfiedFactors.length === 0;
        
      const hasAllWarningFactors = warningFactorIds.length === 0 || 
        missingSatisfiedWarningFactors.length === 0;
      
      // Validation status based on satisfied factors
      let status = 'passed';
      let valid = true;
      
      if (!hasAllRequiredFactors) {
        status = 'failed';
        valid = false;
      } else if (!hasAllWarningFactors) {
        status = 'warning';
        valid = true; // Still considered valid, but with warnings
      }
      
      // Calculate compliance percentage
      const totalFactors = requiredFactorIds.length + warningFactorIds.length + infoFactorIds.length;
      const totalSatisfiedFactors = 
        requiredFactorIds.filter(id => satisfiedFactors.includes(id)).length +
        warningFactorIds.filter(id => satisfiedFactors.includes(id)).length +
        infoFactorIds.filter(id => satisfiedFactors.includes(id)).length;
      
      const compliancePercentage = totalFactors > 0 
        ? Math.round((totalSatisfiedFactors / totalFactors) * 100) 
        : 100;
      
      // Create detailed factor results if requested
      let factorResults = [];
      
      if (req.query.detailed === 'true') {
        factorResults = [
          ...requiredFactorIds.map(id => {
            const factor = factorsMap.get(id);
            return {
              id,
              name: factor?.name || `Factor #${id}`,
              category: factor?.category || 'unknown',
              criticality: 'required',
              satisfied: satisfiedFactors.includes(id),
              riskLevel: factor?.riskLevel || 'high'
            };
          }),
          ...warningFactorIds.map(id => {
            const factor = factorsMap.get(id);
            return {
              id,
              name: factor?.name || `Factor #${id}`,
              category: factor?.category || 'unknown',
              criticality: 'warning',
              satisfied: satisfiedFactors.includes(id),
              riskLevel: factor?.riskLevel || 'medium'
            };
          }),
          ...infoFactorIds.map(id => {
            const factor = factorsMap.get(id);
            return {
              id,
              name: factor?.name || `Factor #${id}`,
              category: factor?.category || 'unknown',
              criticality: 'informational',
              satisfied: satisfiedFactors.includes(id),
              riskLevel: factor?.riskLevel || 'low'
            };
          })
        ];
      }
      
      // Prepare result message
      let message = 'Section validates successfully';
      
      if (status === 'failed') {
        message = `Section validation failed: ${missingSatisfiedFactors.length} required CTQ factors not satisfied`;
      } else if (status === 'warning') {
        message = `Section has warnings: ${missingSatisfiedWarningFactors.length} recommended CTQ factors not satisfied`;
      }
      
      return {
        sectionCode,
        valid,
        status,
        message,
        compliancePercentage,
        factorResults: req.query.detailed === 'true' ? factorResults : [],
        missingRequiredCount: missingSatisfiedFactors.length,
        missingWarningCount: missingSatisfiedWarningFactors.length,
        missingInfoCount: missingSatisfiedInfoFactors.length
      };
    });
    
    // Calculate overall compliance
    const validSections = results.filter(r => r.valid).length;
    const totalSections = results.length;
    const overallCompliancePercentage = Math.round((validSections / totalSections) * 100);
    
    // Aggregate results by status
    const failedSections = results.filter(r => r.status === 'failed');
    const warningSections = results.filter(r => r.status === 'warning' || r.status === 'no-rule');
    const passedSections = results.filter(r => r.status === 'passed');
    
    // Log batch validation if tracking is enabled
    if (projectId || documentId) {
      logger.info(`Batch section validation for tenant ${tenantId}`, {
        projectId,
        documentId,
        userId: req.userId,
        totalSections: sections.length,
        passedCount: passedSections.length,
        warningCount: warningSections.length,
        failedCount: failedSections.length,
        overallCompliancePercentage
      });
    }
    
    return res.json({
      results,
      summary: {
        totalSections,
        passedSections: passedSections.length,
        warningSections: warningSections.length,
        failedSections: failedSections.length,
        overallCompliancePercentage,
        valid: failedSections.length === 0
      }
    });
  } catch (error) {
    logger.error(`Error performing batch validation for tenant ${req.params.tenantId}`, error);
    return res.status(500).json({ error: 'Failed to perform batch validation' });
  }
});

/**
 * Request a validation waiver/override
 * 
 * This endpoint handles requests to override validation failures
 * based on defined override policies.
 */
router.post('/:tenantId/section-gating/:sectionCode/request-override', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const sectionCode = req.params.sectionCode;
    
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Check permissions - any authenticated user can request overrides, but approval depends on role
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only request overrides for your own organization' });
    }
    
    // Validate the request body
    const overrideRequestSchema = z.object({
      projectId: z.number().optional(),
      documentId: z.number().optional(),
      reason: z.string().min(10, 'Override reason must be at least 10 characters').max(1000),
      evidence: z.string().optional(),
      satisfiedFactors: z.array(z.number()).optional(),
      missingFactors: z.array(z.number())
    });
    
    const validationResult = overrideRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid override request data', 
        details: validationResult.error.format() 
      });
    }
    
    const { reason, evidence, projectId, documentId, satisfiedFactors = [], missingFactors } = validationResult.data;
    
    // Get the gating rule for this section
    const gatingRule = await req.db.select().from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.sectionCode, sectionCode),
        eq(qmpSectionGating.organizationId, tenantId),
        eq(qmpSectionGating.active, true)
      ))
      .limit(1);
    
    if (gatingRule.length === 0) {
      return res.status(404).json({ 
        error: 'Section gating rule not found',
        message: `No active gating rule found for section code "${sectionCode}"`
      });
    }
    
    const rule = gatingRule[0];
    
    // Check if overrides are allowed for this rule
    if (rule.overridePolicy === 'none') {
      return res.status(400).json({
        error: 'Overrides not allowed',
        message: `Overrides are not allowed for section "${sectionCode}". The override policy is set to "none".`
      });
    }
    
    // Determine if the user has permission to self-approve based on override policy
    let canSelfApprove = false;
    let approvalStatus = 'pending';
    
    if (rule.overridePolicy === 'document-reason') {
      // Anyone can override as long as they document the reason
      canSelfApprove = true;
      approvalStatus = 'approved';
    } else if (rule.overridePolicy === 'manager-approval' && 
              (req.userRole === 'super_admin' || req.userRole === 'admin' || req.userRole === 'manager')) {
      // Managers and above can self-approve
      canSelfApprove = true;
      approvalStatus = 'approved';
    } else if (rule.overridePolicy === 'admin-only' && 
              (req.userRole === 'super_admin' || req.userRole === 'admin')) {
      // Only admins can self-approve
      canSelfApprove = true;
      approvalStatus = 'approved';
    }
    
    // Calculate factors for detailed record keeping
    let requiredFactorIds: number[] = rule.requiredCtqFactors || [];
    
    // Verify all the missing factors are actually required
    const invalidMissingFactors = missingFactors.filter(id => !requiredFactorIds.includes(id));
    if (invalidMissingFactors.length > 0) {
      return res.status(400).json({
        error: 'Invalid missing factors',
        message: `Some of the specified missing factors are not required by this section's gate: ${invalidMissingFactors.join(', ')}`
      });
    }
    
    // Create the override record (in a real implementation, this would be saved to a database table)
    const overrideRecord = {
      tenantId,
      sectionCode,
      projectId: projectId || null,
      documentId: documentId || null,
      reason,
      evidence: evidence || null,
      requestedBy: req.userId,
      requestedAt: new Date().toISOString(),
      status: approvalStatus,
      satisfiedFactors,
      missingFactors,
      approvedBy: canSelfApprove ? req.userId : null,
      approvedAt: canSelfApprove ? new Date().toISOString() : null,
      expiresAt: canSelfApprove ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null // 30 days expiry if approved
    };
    
    // Log the override record (in production, this would be saved to the database)
    logger.info(`Override request for section ${sectionCode} in tenant ${tenantId}`, overrideRecord);
    
    return res.json({
      status: approvalStatus,
      message: canSelfApprove 
        ? 'Override request has been automatically approved based on your role' 
        : 'Override request has been submitted and is pending approval',
      canSelfApprove,
      overrideRecord
    });
  } catch (error) {
    logger.error(`Error processing override request for tenant ${req.params.tenantId}, section ${req.params.sectionCode}`, error);
    return res.status(500).json({ error: 'Failed to process override request' });
  }
});

/**
 * Approve or reject a validation override
 * 
 * This endpoint allows admins/managers to approve or reject pending override requests
 */
router.patch('/:tenantId/section-gating/overrides/:overrideId', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const overrideId = req.params.overrideId;
    
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    
    // Only allow access to own tenant unless super_admin
    if (req.userRole !== 'super_admin' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'You can only manage overrides for your own organization' });
    }
    
    // Validate the request body
    const overrideDecisionSchema = z.object({
      action: z.enum(['approve', 'reject']),
      comments: z.string().optional(),
      expiresAt: z.string().optional() // ISO date string
    });
    
    const validationResult = overrideDecisionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid override decision data', 
        details: validationResult.error.format() 
      });
    }
    
    const { action, comments, expiresAt } = validationResult.data;
    
    // In a real implementation, fetch the override record from the database
    // This is a mock response since we don't have the actual table yet
    const isAdmin = req.userRole === 'super_admin' || req.userRole === 'admin';
    const isManager = req.userRole === 'manager';
    
    // Check permissions based on user role
    if (action === 'approve' && !isAdmin && !isManager) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Only managers or administrators can approve override requests'
      });
    }
    
    // Update the override record (in production, this would update the database)
    const updatedOverride = {
      id: overrideId,
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: action === 'approve' ? req.userId : null,
      approvedAt: action === 'approve' ? new Date().toISOString() : null,
      rejectedBy: action === 'reject' ? req.userId : null,
      rejectedAt: action === 'reject' ? new Date().toISOString() : null,
      expiresAt: action === 'approve' && expiresAt ? expiresAt : 
                (action === 'approve' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null),
      comments: comments || null
    };
    
    // Log the override decision (in production, this would be saved to the database)
    logger.info(`Override ${action} for override ID ${overrideId} in tenant ${tenantId}`, updatedOverride);
    
    return res.json({
      status: updatedOverride.status,
      message: action === 'approve' 
        ? `Override request has been approved. Valid until ${updatedOverride.expiresAt}` 
        : 'Override request has been rejected',
      overrideRecord: updatedOverride
    });
  } catch (error) {
    logger.error(`Error processing override decision for tenant ${req.params.tenantId}, override ${req.params.overrideId}`, error);
    return res.status(500).json({ error: 'Failed to process override decision' });
  }
});

export default router;