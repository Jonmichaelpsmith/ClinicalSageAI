import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as controller from '../controllers/coauthorController.js';

const router = express.Router();
router.use(authenticate);
router.post('/coauthor/generate-draft', controller.generateDraft);
export default router;
