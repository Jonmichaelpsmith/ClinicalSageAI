/**
 * FDA Compliance Routes
 * 
 * These routes provide API endpoints for FDA 21 CFR Part 11 compliance functionality,
 * including validation, electronic signatures, audit trails, and blockchain verification.
 */

const express = require('express');
const { FDAComplianceService } = require('../services/fda-compliance-service');
const { ElectronicSignatureService } = require('../services/electronic-signature-service');
const { DataIntegrityService } = require('../services/data-integrity-service');
const { ValidationService } = require('../services/validation-service');
const { BlockchainService } = require('../services/blockchain-service');

const router = express.Router();
const fdaComplianceService = new FDAComplianceService();
const electronicSignatureService = new ElectronicSignatureService();
const dataIntegrityService = new DataIntegrityService();
const validationService = new ValidationService();
const blockchainService = new BlockchainService();

/**
 * @route GET /api/fda-compliance/status
 * @description Get FDA compliance status
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    const validationResults = await fdaComplianceService.validateCompliance();
    res.json({
      status: validationResults.overallScore >= 90 ? 'COMPLIANT' : 'NON_COMPLIANT',
      score: validationResults.overallScore,
      lastValidated: new Date().toISOString(),
      components: {
        electronicSignatures: validationResults.signatureValidation.score,
        dataIntegrity: validationResults.dataIntegrityValidation.score,
        systemValidation: validationResults.systemValidation.score,
        auditTrails: validationResults.auditTrailValidation.score,
        accessControls: validationResults.accessControlValidation.score
      }
    });
  } catch (error) {
    console.error('Error getting FDA compliance status', error);
    res.status(500).json({ error: 'Failed to get FDA compliance status' });
  }
});

/**
 * @route POST /api/fda-compliance/validate
 * @description Run FDA compliance validation
 * @access Private
 */
router.post('/validate', async (req, res) => {
  try {
    const validationResults = await fdaComplianceService.validateCompliance();
    res.json(validationResults);
  } catch (error) {
    console.error('Error running FDA compliance validation', error);
    res.status(500).json({ error: 'Failed to run FDA compliance validation' });
  }
});

/**
 * @route GET /api/fda-compliance/report
 * @description Generate FDA compliance report
 * @access Private
 */
router.get('/report', async (req, res) => {
  try {
    const report = await fdaComplianceService.generateComplianceReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating FDA compliance report', error);
    res.status(500).json({ error: 'Failed to generate FDA compliance report' });
  }
});

/**
 * @route POST /api/fda-compliance/config
 * @description Update FDA compliance configuration
 * @access Private
 */
router.post('/config', async (req, res) => {
  try {
    const config = await fdaComplianceService.updateConfig(req.body);
    res.json(config);
  } catch (error) {
    console.error('Error updating FDA compliance configuration', error);
    res.status(500).json({ error: 'Failed to update FDA compliance configuration' });
  }
});

/**
 * @route POST /api/fda-compliance/signatures
 * @description Create electronic signature
 * @access Private
 */
router.post('/signatures', async (req, res) => {
  try {
    const signature = await electronicSignatureService.createSignature(req.body);
    
    // Store signature on blockchain for enhanced verification
    await blockchainService.storeSignature(signature);
    
    res.json(signature);
  } catch (error) {
    console.error('Error creating electronic signature', error);
    res.status(400).json({ error: error.message || 'Failed to create electronic signature' });
  }
});

/**
 * @route GET /api/fda-compliance/signatures/:id
 * @description Verify electronic signature
 * @access Private
 */
router.get('/signatures/:id', async (req, res) => {
  try {
    const verificationResult = await electronicSignatureService.verifySignature(req.params.id);
    res.json(verificationResult);
  } catch (error) {
    console.error('Error verifying electronic signature', error);
    res.status(500).json({ error: 'Failed to verify electronic signature' });
  }
});

/**
 * @route GET /api/fda-compliance/signatures/document/:documentId
 * @description Get signature history for a document
 * @access Private
 */
router.get('/signatures/document/:documentId', async (req, res) => {
  try {
    const signatureHistory = await electronicSignatureService.getSignatureHistory(req.params.documentId);
    res.json(signatureHistory);
  } catch (error) {
    console.error('Error getting signature history', error);
    res.status(500).json({ error: 'Failed to get signature history' });
  }
});

/**
 * @route POST /api/fda-compliance/documents/hash
 * @description Generate hash for a document
 * @access Private
 */
router.post('/documents/hash', async (req, res) => {
  try {
    const { document } = req.body;
    const hashResult = await dataIntegrityService.generateDocumentHash(document);
    
    // Store hash on blockchain for enhanced verification
    if (req.body.storeOnBlockchain) {
      await blockchainService.storeDocumentHash(document, req.body.userId || 'system');
    }
    
    res.json(hashResult);
  } catch (error) {
    console.error('Error generating document hash', error);
    res.status(500).json({ error: 'Failed to generate document hash' });
  }
});

/**
 * @route POST /api/fda-compliance/documents/verify
 * @description Verify document integrity
 * @access Private
 */
router.post('/documents/verify', async (req, res) => {
  try {
    const { document, originalHash } = req.body;
    const verificationResult = await dataIntegrityService.verifyDocumentIntegrity(document, originalHash);
    res.json(verificationResult);
  } catch (error) {
    console.error('Error verifying document integrity', error);
    res.status(500).json({ error: 'Failed to verify document integrity' });
  }
});

/**
 * @route POST /api/fda-compliance/audit
 * @description Create audit record
 * @access Private
 */
router.post('/audit', async (req, res) => {
  try {
    const auditRecord = await dataIntegrityService.createAuditRecord(req.body);
    res.json(auditRecord);
  } catch (error) {
    console.error('Error creating audit record', error);
    res.status(400).json({ error: error.message || 'Failed to create audit record' });
  }
});

/**
 * @route GET /api/fda-compliance/audit/verify/:id
 * @description Verify audit record integrity
 * @access Private
 */
router.get('/audit/verify/:id', async (req, res) => {
  try {
    // In a real implementation, this would retrieve the audit record from a database
    const auditRecord = { id: req.params.id, /* other fields */ };
    
    const verificationResult = await dataIntegrityService.verifyAuditRecordIntegrity(auditRecord);
    res.json(verificationResult);
  } catch (error) {
    console.error('Error verifying audit record integrity', error);
    res.status(500).json({ error: 'Failed to verify audit record integrity' });
  }
});

/**
 * @route GET /api/fda-compliance/validation/status
 * @description Get system validation status
 * @access Private
 */
router.get('/validation/status', async (req, res) => {
  try {
    const validationStatus = validationService.getValidationStatus();
    res.json(validationStatus);
  } catch (error) {
    console.error('Error getting validation status', error);
    res.status(500).json({ error: 'Failed to get validation status' });
  }
});

/**
 * @route POST /api/fda-compliance/validation/run
 * @description Run system validation
 * @access Private
 */
router.post('/validation/run', async (req, res) => {
  try {
    const validationResults = await validationService.runSystemValidation();
    
    // Generate validation report
    const validationReport = validationService.generateValidationReport(validationResults);
    
    // Track validation history
    validationService.trackValidationHistory(validationResults);
    
    res.json({
      validationResults,
      validationReport
    });
  } catch (error) {
    console.error('Error running system validation', error);
    res.status(500).json({ error: 'Failed to run system validation' });
  }
});

/**
 * @route GET /api/fda-compliance/blockchain/status
 * @description Get blockchain status
 * @access Private
 */
router.get('/blockchain/status', async (req, res) => {
  try {
    const blockchainStatus = await blockchainService.getBlockchainStatus();
    res.json(blockchainStatus);
  } catch (error) {
    console.error('Error getting blockchain status', error);
    res.status(500).json({ error: 'Failed to get blockchain status' });
  }
});

/**
 * @route GET /api/fda-compliance/blockchain/transactions
 * @description Get recent blockchain transactions
 * @access Private
 */
router.get('/blockchain/transactions', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const transactions = await blockchainService.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting blockchain transactions', error);
    res.status(500).json({ error: 'Failed to get blockchain transactions' });
  }
});

/**
 * @route POST /api/fda-compliance/blockchain/verify
 * @description Verify blockchain integrity
 * @access Private
 */
router.post('/blockchain/verify', async (req, res) => {
  try {
    const verificationResult = await blockchainService.verifyBlockchainIntegrity();
    res.json(verificationResult);
  } catch (error) {
    console.error('Error verifying blockchain integrity', error);
    res.status(500).json({ error: 'Failed to verify blockchain integrity' });
  }
});

/**
 * @route GET /api/fda-compliance/blockchain/document/:documentId
 * @description Get blockchain transaction history for a document
 * @access Private
 */
router.get('/blockchain/document/:documentId', async (req, res) => {
  try {
    const transactions = await blockchainService.getTransactionHistory(req.params.documentId);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting document transaction history', error);
    res.status(500).json({ error: 'Failed to get document transaction history' });
  }
});

module.exports = router;