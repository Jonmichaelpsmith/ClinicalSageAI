import express from 'express';
import * as controller from '../controllers/coauthorController.js';
import { validateGenerateDraft } from '../middleware/coauthorValidation.js';

const router = express.Router();

router.post('/generate-draft', validateGenerateDraft, controller.generateDraft);
router.get('/sections', controller.getSections);
router.post('/layout/:id', controller.updateSectionLayout);
router.post('/connect', controller.connectSections);
router.get('/annotation/:id', controller.getAnnotation);
router.post('/annotation/:id', controller.saveAnnotation);
router.post('/advice', controller.getAdvice);

export default router;
