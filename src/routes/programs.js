import { Router } from 'express';
import { listPrograms, createProgram } from '../controllers/programController.js';

const router = Router();

router.get('/', listPrograms);          // GET /api/programs
router.post('/', createProgram);        // POST /api/programs

export default router;