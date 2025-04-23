import express from 'express';

const router = express.Router();

// Basic CER endpoints
router.get('/', (req, res) => {
  res.json({ message: 'CER API is working' });
});

router.post('/generate', (req, res) => {
  res.json({ 
    message: 'CER generation endpoint',
    status: 'Not yet implemented'
  });
});

export default router;