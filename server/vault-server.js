import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { generateMockToken } from './middleware/auth.js';
import documentRoutes from './routes/documents.js';
import auditRoutes from './routes/audit.js';
import supabase from './lib/supabaseClient.js';
import { isAiAvailable } from './services/ai.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Log environment status
console.log('Starting TrialSage Vault API with configuration:');
console.log('- SUPABASE_URL configured:', !!process.env.SUPABASE_URL);
console.log('- SUPABASE_SERVICE_ROLE_KEY configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('- JWT_SECRET configured:', !!process.env.JWT_SECRET);
console.log('- OpenAI API available:', isAiAvailable());

// Root route
app.get('/api/vault', (_, res) => {
  res.json({
    name: 'TrialSage Vault API',
    version: '1.0.0',
    status: 'operational',
  });
});

// For demo purposes, generate a mock token
app.get('/api/vault/mock-token', (_, res) => {
  const token = generateMockToken();
  res.json({ token });
});

// Health check
app.get('/api/vault/health', (_, res) => {
  const connectionStatus = {
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    openai: isAiAvailable(),
    jwt: !!process.env.JWT_SECRET
  };
  
  res.json({ 
    status: 'ok',
    connections: connectionStatus,
    timestamp: new Date().toISOString()
  });
});

// Mount route handlers
app.use('/api/vault/documents', documentRoutes);
app.use('/api/vault/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.VAULT_PORT || 4000;
app.listen(PORT, () => {
  console.log(`TrialSage Vault API running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/vault/health`);
});