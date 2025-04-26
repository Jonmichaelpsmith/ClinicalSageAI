import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import auditRoutes from './routes/audit.js';
import referenceModelRoutes from './routes/reference-model.js';
import { verifyJwt } from './middleware/auth.js';
import { logger, sentryMiddleware } from './utils/logger.js';

const app = express();

// Security enhancements
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://trialsage.com', 'https://vault.trialsage.com'] 
    : true,
  credentials: true 
}));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 200 requests per windowMs
}));

app.use(express.json({ limit: '50mb' }));

// Logging middleware - capture request info
app.use((req, res, next) => { 
  logger.info({ 
    url: req.url, 
    method: req.method,
    user: req.user?.id, 
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }); 
  next(); 
});

// Sentry error handling middleware
app.use(sentryMiddleware);

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/documents', verifyJwt, documentRoutes);
app.use('/api/audit', verifyJwt, auditRoutes);
app.use('/api/reference-model', verifyJwt, referenceModelRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`TrialSage Vault API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured. Error tracking is disabled.');
  } else {
    logger.info('Sentry monitoring configured successfully');
  }
});