const express = require('express');
const cerRoutes = require('./cer');

const router = express.Router();

// Register API routes
router.use('/cer', cerRoutes);

module.exports = router;
module.exports.default = router; // Add default export for ESM compatibility