import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import { setupVite } from './vite';
import qmpRoutes from './routes/qmp.js';
import qmpAuditRoutes from './routes/qmp-audit.js';
import reportsRoutes from './routes/reports.js';
import cerv2ProtectionRoutes from './routes/cerv2-protection.js';
import tenantSectionGatingRoutes from './routes/tenant-section-gating.js';
import moduleIntegrationRoutes from './routes/moduleIntegrationRoutes';
import deviceProfileRoutes from './routes/deviceProfileRoutes';
import { router as estar510kRouter } from './routes/510kEstarRoutes.ts';
import fda510kRoutes from './routes/fda510kRoutes.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Apply JSON parsing middleware
app.use(express.json());

// Serve static files from the root directory
app.use('/js', express.static('./js'));
app.use('/public', express.static('./public'));

// Register API routes
app.use('/api/qmp', qmpRoutes);
console.log('QMP API routes registered');

app.use('/api/qmp', qmpAuditRoutes);
console.log('QMP Audit Trail routes registered');

app.use('/api/reports', reportsRoutes);
console.log('Reports API routes registered');

app.use('/api/cerv2/protection', cerv2ProtectionRoutes);
console.log('CERV2 Protection API routes registered');

app.use('/api/tenant', tenantSectionGatingRoutes);
console.log('Tenant Section Gating routes registered');

app.use('/api/modules', moduleIntegrationRoutes);
console.log('Module Integration routes registered');

app.use('/api/device-profiles', deviceProfileRoutes);
console.log('Unified Device Profile routes registered at /api/device-profiles');

app.use('/api/fda510k/estar', estar510kRouter);
console.log('FDA 510(k) eSTAR routes registered at /api/fda510k/estar');

app.use('/api/fda510k', fda510kRoutes);
console.log('FDA 510(k) routes registered at /api/fda510k');

// Fix for problematic route causing path-to-regexp error
app.get('/api/fda510k/predicates', (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    
    // Return sample predicate devices based on search term
    const predicates = [
      {
        predicateId: 'K123456',
        kNumber: 'K123456',
        deviceName: `${searchTerm} Monitor Pro`,
        decisionDate: '2022-08-15',
        productCode: 'DPS',
        applicant: 'MedTech Inc.',
        deviceClass: 'II'
      },
      {
        predicateId: 'K789012',
        kNumber: 'K789012',
        deviceName: `CardioTech ${searchTerm} System`,
        decisionDate: '2021-04-22',
        productCode: 'DPS',
        applicant: 'CardioTech',
        deviceClass: 'II'
      }
    ];
    
    res.json({ 
      predicates,
      searchQuery: searchTerm
    });
  } catch (error) {
    console.error('Error in predicate device search:', error);
    res.status(500).json({ error: 'Failed to search for predicate devices' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Set up Vite for development
setupVite(app);

// Create HTTP server
const httpServer = createHttpServer(app);

// Start the server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;