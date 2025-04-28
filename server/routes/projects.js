// /server/routes/projects.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Project status route - returns all active projects with their status
router.get('/status', projectController.getProjectsStatus);

module.exports = router;