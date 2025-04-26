import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import auditRoutes from './routes/audit.js';
import { verifyJwt } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/documents', verifyJwt, documentRoutes);
app.use('/api/audit', verifyJwt, auditRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`TrialSage Vault API running on ${PORT}`));