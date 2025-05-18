import { authMiddleware } from '../auth';
import { 
  qualityManagementPlans,
  // Note: cerSections is not exported from the schema yet, will be added later
} from '../../shared/schema';

// Define these locally since they're not exported from schema
const qmpSectionGating = {
  id: 'id',
  organizationId: 'organization_id',
  qmpId: 'qmp_id',
  sectionKey: 'section_key',
  status: 'status',
  lastModified: 'last_modified'
};

const ctqFactors = {
  id: 'id',
  organizationId: 'organization_id',
  name: 'name',
  description: 'description',
  category: 'category',
  riskLevel: 'risk_level',
  validationRule: 'validation_rule',
  applicableSection: 'applicable_section'
};

import { requireOrganizationContext } from '../middleware/tenantContext';
import { getDb } from '../db/tenantDbHelper';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('tenant-section-gating');

const router = authMiddleware.Router();

// Get all section gating entries for a tenant
router.get('/', requireOrganizationContext, async (req, res) => {
  try {
    const db = getDb();
    const { organizationId } = req.tenantContext;

    const result = await db.query(
      `SELECT * FROM ${qmpSectionGating.tableName} WHERE organization_id = $1`,
      [organizationId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    logger.error('Error fetching tenant section gating', { error: err });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenant section gating settings'
    });
  }
});

// Create or update section gating for a specific QMP and section
router.post('/:qmpId/:sectionKey', requireOrganizationContext, async (req, res) => {
  try {
    const db = getDb();
    const { organizationId } = req.tenantContext;
    const { qmpId, sectionKey } = req.params;
    const { isGated, gatingFactors } = req.body;

    // Check if QMP exists and belongs to this organization
    const qmpResult = await db.query(
      `SELECT * FROM ${qualityManagementPlans.tableName} 
       WHERE id = $1 AND organization_id = $2`,
      [qmpId, organizationId]
    );

    if (qmpResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quality Management Plan not found'
      });
    }

    // Check if section gating entry already exists
    const existingEntry = await db.query(
      `SELECT * FROM ${qmpSectionGating.tableName} 
       WHERE qmp_id = $1 AND section_key = $2 AND organization_id = $3`,
      [qmpId, sectionKey, organizationId]
    );

    let result;

    if (existingEntry.rows.length > 0) {
      // Update existing entry
      result = await db.query(
        `UPDATE ${qmpSectionGating.tableName} 
         SET is_gated = $1, gating_factors = $2, updated_at = NOW()
         WHERE qmp_id = $3 AND section_key = $4 AND organization_id = $5
         RETURNING *`,
        [isGated, JSON.stringify(gatingFactors), qmpId, sectionKey, organizationId]
      );
    } else {
      // Create new entry
      result = await db.query(
        `INSERT INTO ${qmpSectionGating.tableName} 
         (organization_id, qmp_id, section_key, is_gated, gating_factors, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [organizationId, qmpId, sectionKey, isGated, JSON.stringify(gatingFactors)]
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    logger.error('Error updating section gating', { error: err });
    res.status(500).json({
      success: false,
      error: 'Failed to update section gating'
    });
  }
});

// Get eligible CTQ factors for a section
router.get('/ctq-factors/:sectionKey', requireOrganizationContext, async (req, res) => {
  try {
    const db = getDb();
    const { organizationId } = req.tenantContext;
    const { sectionKey } = req.params;

    const result = await db.query(
      `SELECT * FROM ${ctqFactors.tableName} 
       WHERE organization_id = $1 
       AND (applicable_section = $2 OR applicable_section = 'all')
       ORDER BY name ASC`,
      [organizationId, sectionKey]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    logger.error('Error fetching CTQ factors', { error: err });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CTQ factors'
    });
  }
});

export default router;