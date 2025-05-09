/**
 * Tenant Section Gating API Routes
 * 
 * These endpoints manage the quality gating rules for CER document sections,
 * implementing risk-based quality controls through Critical-to-Quality (CtQ) factors.
 */
import { Router, Request } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { authMiddleware } from '../auth';
import { 
  qmpSectionGating, 
  ctqFactors,
  qualityManagementPlans,
  // Note: cerSections is not exported from the schema yet, will be added later
} from '../../shared/schema';
import { requireTenantMiddleware } from '../middleware/tenantContext';
import { getDb } from '../db/tenantDbHelper';
import { createScopedLogger } from '../utils/logger';

const router = Router();
const logger = createScopedLogger('section-gating-routes');

/**
 * Get section gating rules for a specific CER and QMP
 */
router.get('/:qmpId/sections', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { qmpId } = req.params;
    const { organizationId } = req.tenantContext;
    
    // Convert qmpId to number
    const qmpIdNumber = parseInt(qmpId, 10);
    if (isNaN(qmpIdNumber)) {
      return res.status(400).json({ error: 'Invalid QMP ID format' });
    }
    
    // Get section gating rules with tenant isolation
    const sectionRules = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.qmpId, qmpIdNumber)
      ));
    
    return res.json({ rules: sectionRules });
  } catch (error) {
    logger.error('Error retrieving section gating rules', { error });
    return res.status(500).json({ error: 'Failed to retrieve section gating rules' });
  }
});

/**
 * Get a specific section gating rule by ID
 */
router.get('/rule/:id', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.tenantContext;
    
    // Convert id to number
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID format' });
    }
    
    // Get section gating rule with tenant isolation
    const rule = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ))
      .limit(1)
      .then(results => results[0] || null);
    
    if (!rule) {
      return res.status(404).json({ error: 'Section gating rule not found' });
    }
    
    // Get associated CTQ factors
    if (rule.qmpSectionGating.ctqFactors && rule.qmpSectionGating.ctqFactors.length > 0) {
      const ctqFactorIds = rule.qmpSectionGating.ctqFactors;
      
      const factors = await getDb(req)
        .select()
        .from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, organizationId),
          sql`${ctqFactors.id} = ANY(${ctqFactorIds})`
        ));
      
      rule.ctqFactorDetails = factors;
    }
    
    return res.json(rule);
  } catch (error) {
    logger.error('Error retrieving section gating rule', { error });
    return res.status(500).json({ error: 'Failed to retrieve section gating rule' });
  }
});

/**
 * Create a new section gating rule
 */
router.post('/', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { organizationId, userId } = req.tenantContext;
    
    // Validate input
    const ruleSchema = z.object({
      qmpId: z.number(),
      sectionKey: z.string(),
      ctqFactors: z.array(z.number()).optional(),
      requiredLevel: z.enum(['hard', 'soft', 'info']).default('info'),
      customValidations: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        rule: z.string(),
        severity: z.enum(['high', 'medium', 'low']).default('medium')
      })).optional(),
      validationUrl: z.string().optional(),
      active: z.boolean().default(true)
    });
    
    const validationResult = ruleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid section gating rule data',
        details: validationResult.error.format()
      });
    }
    
    const ruleData = validationResult.data;
    
    // Verify the QMP belongs to the tenant
    const qmpResults = await getDb(req)
      .select()
      .from(qualityManagementPlans)
      .where(and(
        eq(qualityManagementPlans.organizationId, organizationId),
        eq(qualityManagementPlans.id, ruleData.qmpId)
      ))
      .limit(1);
    
    const qmp = qmpResults[0];
    if (!qmp) {
      return res.status(404).json({ error: 'QMP not found or access denied' });
    }
    
    // Verify that section exists
    const sectionResults = await getDb(req)
      .select()
      .from(cerSections)
      .where(eq(cerSections.key, ruleData.sectionKey))
      .limit(1);
    
    const section = sectionResults[0];
    if (!section) {
      return res.status(404).json({ error: 'CER section not found' });
    }
    
    // Verify all CTQ factors belong to the tenant
    if (ruleData.ctqFactors && ruleData.ctqFactors.length > 0) {
      const ctqFactorResults = await getDb(req)
        .select()
        .from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, organizationId),
          sql`${ctqFactors.id} = ANY(${ruleData.ctqFactors})`
        ));
      
      if (ctqFactorResults.length !== ruleData.ctqFactors.length) {
        return res.status(404).json({ error: 'One or more CTQ factors not found or access denied' });
      }
    }
    
    // Check if a rule already exists for this QMP and section
    const existingRuleResults = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.qmpId, ruleData.qmpId),
        eq(qmpSectionGating.sectionKey, ruleData.sectionKey)
      ))
      .limit(1);
    
    const existingRule = existingRuleResults[0];
    if (existingRule) {
      return res.status(409).json({ 
        error: 'Section gating rule already exists',
        existingRule
      });
    }
    
    // Set organization ID from tenant context
    const newRule = {
      ...ruleData,
      organizationId,
      createdById: userId,
      updatedById: userId
    };
    
    // Create section gating rule
    const result = await getDb(req)
      .insert(qmpSectionGating)
      .values(newRule)
      .returning();
    
    // Get the newly created rule with section details
    const createdRule = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, result[0].id)
      ))
      .limit(1)
      .then(results => results[0]);
    
    return res.status(201).json(createdRule);
  } catch (error) {
    logger.error('Error creating section gating rule', { error });
    return res.status(500).json({ error: 'Failed to create section gating rule' });
  }
});

/**
 * Update a section gating rule
 */
router.put('/:id', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, userId } = req.tenantContext;
    
    // Convert id to number
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID format' });
    }
    
    // Validate input
    const updateSchema = z.object({
      ctqFactors: z.array(z.number()).optional(),
      requiredLevel: z.enum(['hard', 'soft', 'info']).optional(),
      customValidations: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        rule: z.string(),
        severity: z.enum(['high', 'medium', 'low']).default('medium')
      })).optional(),
      validationUrl: z.string().optional(),
      active: z.boolean().optional()
    });
    
    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid section gating rule data',
        details: validationResult.error.format()
      });
    }
    
    const updateData = validationResult.data;
    
    // Check if rule exists and belongs to tenant
    const existingRuleResults = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ))
      .limit(1);
    
    const existingRule = existingRuleResults[0];
    if (!existingRule) {
      return res.status(404).json({ error: 'Section gating rule not found or access denied' });
    }
    
    // Verify all CTQ factors belong to the tenant if they are being updated
    if (updateData.ctqFactors && updateData.ctqFactors.length > 0) {
      const ctqFactorResults = await getDb(req)
        .select()
        .from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, organizationId),
          sql`${ctqFactors.id} = ANY(${updateData.ctqFactors})`
        ));
      
      if (ctqFactorResults.length !== updateData.ctqFactors.length) {
        return res.status(404).json({ error: 'One or more CTQ factors not found or access denied' });
      }
    }
    
    // Update the rule
    await getDb(req)
      .update(qmpSectionGating)
      .set({ 
        ...updateData,
        updatedById: userId,
        updatedAt: new Date()
      })
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ));
    
    // Get the updated rule with section details
    const updatedRule = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ))
      .limit(1)
      .then(results => results[0]);
    
    // Get associated CTQ factors
    if (updatedRule.qmpSectionGating.ctqFactors && updatedRule.qmpSectionGating.ctqFactors.length > 0) {
      const ctqFactorIds = updatedRule.qmpSectionGating.ctqFactors;
      
      const factors = await getDb(req)
        .select()
        .from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, organizationId),
          sql`${ctqFactors.id} = ANY(${ctqFactorIds})`
        ));
      
      updatedRule.ctqFactorDetails = factors;
    }
    
    return res.json(updatedRule);
  } catch (error) {
    logger.error('Error updating section gating rule', { error });
    return res.status(500).json({ error: 'Failed to update section gating rule' });
  }
});

/**
 * Delete a section gating rule
 */
router.delete('/:id', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.tenantContext;
    
    // Convert id to number
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID format' });
    }
    
    // Check if rule exists and belongs to tenant
    const existingRuleResults = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ))
      .limit(1);
    
    const existingRule = existingRuleResults[0];
    if (!existingRule) {
      return res.status(404).json({ error: 'Section gating rule not found or access denied' });
    }
    
    // Check if the rule is in use anywhere (in the future we might want to check CER projects)
    
    // Delete the rule
    await getDb(req)
      .delete(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.id, ruleId)
      ));
    
    return res.json({ success: true, message: 'Section gating rule deleted successfully' });
  } catch (error) {
    logger.error('Error deleting section gating rule', { error });
    return res.status(500).json({ error: 'Failed to delete section gating rule' });
  }
});

/**
 * Validate CER sections against quality gating rules
 */
router.post('/:qmpId/validate', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { qmpId } = req.params;
    const { organizationId } = req.tenantContext;
    const { sectionCodes, sectionContents, requestWaiver } = req.body;
    
    // Convert qmpId to number
    const qmpIdNumber = parseInt(qmpId, 10);
    if (isNaN(qmpIdNumber)) {
      return res.status(400).json({ error: 'Invalid QMP ID format' });
    }
    
    // Validate input
    if (!Array.isArray(sectionCodes) || sectionCodes.length === 0) {
      return res.status(400).json({ error: 'Section codes must be a non-empty array' });
    }
    
    if (!sectionContents || typeof sectionContents !== 'object') {
      return res.status(400).json({ error: 'Section contents must be an object mapping section codes to content' });
    }
    
    // Get all gating rules for the requested sections
    const sectionRules = await getDb(req)
      .select()
      .from(qmpSectionGating)
      .where(and(
        eq(qmpSectionGating.organizationId, organizationId),
        eq(qmpSectionGating.qmpId, qmpIdNumber),
        eq(qmpSectionGating.active, true),
        sql`${qmpSectionGating.sectionKey} = ANY(${sectionCodes})`
      ))
      .leftJoin(cerSections, eq(qmpSectionGating.sectionKey, cerSections.key));
    
    // No rules found
    if (sectionRules.length === 0) {
      return res.json({
        valid: true,
        message: 'No active gating rules found for the specified sections',
        sectionResults: sectionCodes.map(code => ({
          sectionCode: code,
          valid: true,
          requiredLevel: 'info',
          message: 'No gating rules defined for this section',
          factors: []
        }))
      });
    }
    
    // Get all CTQ factors for these rules
    const ctqFactorIds = sectionRules
      .map(rule => rule.qmpSectionGating.ctqFactors || [])
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i); // Unique factor IDs
    
    let ctqFactorDetails = [];
    if (ctqFactorIds.length > 0) {
      ctqFactorDetails = await getDb(req)
        .select()
        .from(ctqFactors)
        .where(and(
          eq(ctqFactors.organizationId, organizationId),
          sql`${ctqFactors.id} = ANY(${ctqFactorIds})`
        ));
    }
    
    // Transform data for each section and evaluate CTQ factors
    const sectionResults = await Promise.all(sectionRules.map(async rule => {
      const sectionKey = rule.qmpSectionGating.sectionKey;
      const sectionContent = sectionContents[sectionKey] || '';
      
      // Get factors for this rule
      const ruleFactorIds = rule.qmpSectionGating.ctqFactors || [];
      const factors = ctqFactorDetails.filter(f => ruleFactorIds.includes(f.id));
      
      // Evaluate factors for this section
      const factorResults = await Promise.all(factors.map(async factor => {
        let valid = true;
        let message = 'Validation not implemented';
        
        // Here we would normally implement the validation logic based on the factor's validation rule
        // For demonstration, we'll simulate validation based on the risk level
        
        if (factor.validationRule) {
          try {
            // This is where you would evaluate the validation rule against the section content
            // For now, we're simulating validation with simple content presence check
            const requiredTerms = factor.validationRule.split(',').map(t => t.trim());
            const hasMissingTerms = requiredTerms.some(term => !sectionContent.includes(term));
            
            valid = !hasMissingTerms;
            message = valid 
              ? `Validation successful for "${factor.name}"`
              : `Failed validation: Missing required content for "${factor.name}"`;
          } catch (error) {
            logger.error('Error evaluating factor validation rule', { 
              error, 
              factorId: factor.id, 
              rule: factor.validationRule 
            });
            valid = false;
            message = 'Error evaluating validation rule';
          }
        }
        
        return {
          factorId: factor.id,
          name: factor.name,
          riskLevel: factor.riskLevel,
          valid,
          message
        };
      }));
      
      // Determine overall section validity
      const hasFailedHardFactors = factorResults.some(r => 
        !r.valid && (r.riskLevel === 'high' || rule.qmpSectionGating.requiredLevel === 'hard')
      );
      
      const hasFailedSoftFactors = factorResults.some(r => 
        !r.valid && r.riskLevel === 'medium' && rule.qmpSectionGating.requiredLevel !== 'info'
      );
      
      // If this is a waiver request, mark as valid but include waiver info
      const isWaiverRequest = !!requestWaiver;
      
      return {
        sectionCode,
        sectionName: rule.cerSections?.name || sectionCode,
        requiredLevel: rule.qmpSectionGating.requiredLevel,
        valid: isWaiverRequest ? true : !(hasFailedHardFactors || hasFailedSoftFactors),
        factors: factorResults,
        waiver: isWaiverRequest ? {
          requested: true,
          reason: req.body.waiverReason || 'No reason provided',
          timestamp: new Date().toISOString(),
          userId: req.tenantContext.userId
        } : undefined
      };
    }));
    
    // Determine overall validation result
    const allSectionsValid = sectionResults.every(r => r.valid);
    
    return res.json({
      valid: allSectionsValid,
      message: allSectionsValid 
        ? 'All sections passed validation' 
        : 'One or more sections failed validation',
      sectionResults
    });
  } catch (error) {
    logger.error('Error validating sections', { error });
    return res.status(500).json({ error: 'Failed to validate sections against gating rules' });
  }
});

/**
 * Handle quality waivers for gating rules
 */
router.post('/:qmpId/waiver', authMiddleware, requireTenantMiddleware, async (req, res) => {
  try {
    const { qmpId } = req.params;
    const { organizationId, userId } = req.tenantContext;
    const { sectionCodes, reason, projectId } = req.body;
    
    // Validate input
    if (!Array.isArray(sectionCodes) || sectionCodes.length === 0) {
      return res.status(400).json({ error: 'Section codes must be a non-empty array' });
    }
    
    if (!reason) {
      return res.status(400).json({ error: 'Waiver reason is required' });
    }
    
    // Convert qmpId to number
    const qmpIdNumber = parseInt(qmpId, 10);
    if (isNaN(qmpIdNumber)) {
      return res.status(400).json({ error: 'Invalid QMP ID format' });
    }
    
    // Create waiver entries for each section
    const waivers = await Promise.all(sectionCodes.map(async sectionCode => {
      // Get the gating rule for this section
      const ruleResults = await getDb(req)
        .select()
        .from(qmpSectionGating)
        .where(and(
          eq(qmpSectionGating.organizationId, organizationId),
          eq(qmpSectionGating.qmpId, qmpIdNumber),
          eq(qmpSectionGating.sectionKey, sectionCode)
        ))
        .limit(1);
      
      const rule = ruleResults[0];
      if (!rule) {
        return {
          sectionCode,
          status: 'skipped',
          message: 'No gating rule found for this section'
        };
      }
      
      // Create waiver record
      const waiver = {
        organizationId,
        qmpId: qmpIdNumber,
        sectionCode,
        ruleId: rule.id,
        projectId: projectId || null,
        requestedById: userId || null,
        reason,
        status: 'pending',
        requestedAt: new Date()
      };
      
      // In a real system, we would insert this into a waivers table
      // For now, just return the waiver object
      
      return {
        ...waiver,
        status: 'created',
        message: 'Waiver request submitted successfully'
      };
    }));
    
    return res.status(201).json({
      success: true,
      waivers
    });
  } catch (error) {
    logger.error('Error creating waiver requests', { error });
    return res.status(500).json({ error: 'Failed to create waiver requests' });
  }
});

export default router;