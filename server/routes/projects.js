// /server/routes/projects.js

import express from 'express';
import * as projectController from '../controllers/projectController.js';

const router = express.Router();

// GET /api/projects/status - Get projects by status
// Note: This must be before the /:id route to avoid conflicts
router.get('/status', projectController.getProjectsByStatus);

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:id - Get a specific project by ID
router.get('/:id', projectController.getProjectById);

// POST /api/projects - Create a new project
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update an existing project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', projectController.deleteProject);

export default router;