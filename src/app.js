import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { requireAuth } from './middleware/auth.js';
import programsRouter from './routes/programs.js';
import docsRouter from './routes/documents.js';
import searchRouter from './routes/search.js';
import lockRouter from './routes/lock.js';
import adminRouter from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

// health‑check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// secured routes
app.use('/api/programs', requireAuth, programsRouter);
// documents routes already include requireAuth middleware
app.use('/api', docsRouter);
// search routes
app.use('/api', searchRouter);
// lock routes
app.use('/api', lockRouter);
// admin routes
app.use('/api', adminRouter);

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/public'));

  // Handle SPA routing for React Router
  app.get('*', (req, res) => {
    res.sendFile('dist/public/index.html', { root: '.' });
  });
}

// global error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));