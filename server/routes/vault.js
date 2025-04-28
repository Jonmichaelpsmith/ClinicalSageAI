// /server/routes/vault.js

const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');

// Route: GET /api/vault/recent-docs
router.get('/recent-docs', vaultController.getRecentDocuments);

module.exports = router;