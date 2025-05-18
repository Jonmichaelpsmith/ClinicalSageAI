// Fixed routes to replace problematic route causing path-to-regexp error

const express = require('express');
const router = express.Router();

// This is a fixed implementation that removes the malformed URL pattern
// that was causing the path-to-regexp error

// Fix for any problematic git routes
router.get('/git/new', (req, res) => {
  res.json({
    success: true,
    message: 'Git route accessed successfully',
    timestamp: new Date().toISOString()
  });
});

router.get('/git', (req, res) => {
  res.json({
    success: true,
    message: 'Git base route accessed successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;