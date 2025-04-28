// /server/routes/projects.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:id - Get a specific project by ID
router.get('/:id', projectController.getProjectById);

// GET /api/projects/status - Get projects by status
router.get('/status', projectController.getProjectsByStatus);

// POST /api/projects - Create a new project
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update an existing project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', projectController.deleteProject);

module.exports = router;