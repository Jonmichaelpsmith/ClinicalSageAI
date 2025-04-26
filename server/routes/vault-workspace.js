/**
 * Vault Workspace Override Route
 * This module is a direct implementation that ensures the React UI is properly displayed
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// Priority route for Vault Workspace page
router.get('/', (req, res) => {
  console.log("[DIRECT] Serving Vault Workspace React UI");
  res.sendFile(path.join(process.cwd(), 'vault-workspace.html'));
});

module.exports = router;