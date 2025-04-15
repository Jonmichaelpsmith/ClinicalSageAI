// Simple server test to verify port binding works
import express from 'express';
const app = express();

// Create a super simple Express app
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

// Listen on port 5000
const port = 5000;
console.log(`Attempting to listen on port ${port}...`);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Test server successfully started and serving on port ${port}`);
});