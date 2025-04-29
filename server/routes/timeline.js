import express from 'express';
const router = express.Router();

/**
 * Playbook validation rules
 * - Each playbook has specific requirements that must be met
 * - Used to determine if a playbook strategy is viable given current state
 */
const playbookValidation = {
  'fast-ind': [
    { field: 'preclinical', minimumValue: 80, message: 'Preclinical data must be at least 80% complete' },
    { field: 'manufacturingReadiness', minimumValue: 60, message: 'Manufacturing readiness must be at least 60%' }
  ],
  'standard': [
    { field: 'preclinical', minimumValue: 70, message: 'Preclinical data must be at least 70% complete' }
  ],
  'full-nda': [
    { field: 'clinicalTrials', minimumValue: 90, message: 'Clinical trials must be at least 90% complete' },
    { field: 'preclinical', minimumValue: 95, message: 'Preclinical data must be at least 95% complete' },
    { field: 'manufacturingReadiness', minimumValue: 85, message: 'Manufacturing readiness must be at least 85%' }
  ],
  'ema-impd': [
    { field: 'preclinical', minimumValue: 85, message: 'Preclinical data must be at least 85% complete' },
    { field: 'manufacturingReadiness', minimumValue: 80, message: 'Manufacturing readiness must be at least 80%' },
    { field: 'qualitySystem', minimumValue: 90, message: 'Quality system must be at least 90% complete' }
  ]
};

/**
 * Current state values
 * In a real implementation, these would be fetched from a database
 */
const currentState = {
  preclinical: 85,
  clinicalTrials: 75,
  manufacturingReadiness: 82,
  qualitySystem: 88
};

/**
 * GET /api/timeline/info
 * Returns:
 *  - readiness: current readiness % 
 *  - missingDays: estimated days of work remaining
 *  - reviewDays: estimated FDA review duration
 */
router.get('/info', (req, res) => {
  // In a real implementation, compute readiness & missingDays
  const readiness = 82;           // e.g. 82% ready
  const totalMissingWork = 45;    // days if 0% ready
  const missingDays = Math.round((100 - readiness) / 100 * totalMissingWork);
  const reviewDays  = 30;         // FDA review duration
  
  res.json({ readiness, missingDays, reviewDays });
});

/**
 * GET /api/timeline/playbooks
 * Returns:
 *  - valid playbooks with their validation status 
 */
router.get('/playbooks', (req, res) => {
  const results = Object.keys(playbookValidation).map(playbook => {
    const rules = playbookValidation[playbook];
    const validationResults = rules.map(rule => {
      const currentValue = currentState[rule.field];
      const isValid = currentValue >= rule.minimumValue;
      
      return {
        field: rule.field,
        required: rule.minimumValue,
        current: currentValue,
        isValid,
        message: isValid ? null : rule.message
      };
    });
    
    const isPlaybookValid = validationResults.every(r => r.isValid);
    
    return {
      id: playbook,
      isValid: isPlaybookValid,
      validations: validationResults
    };
  });
  
  res.json(results);
});

export default router;