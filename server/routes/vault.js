const express = require('express');
const router = express.Router();
const { getRecentDocuments } = require('../controllers/vaultController');

router.get('/vault/recent-docs', getRecentDocuments);

module.exports = router;