import { Express } from 'express';

/**
 * Register all routes with the Express application
 * 
 * @param app Express application instance
 */
export default function registerRoutes(app: Express): void {
  // Simple health check route
  app.get('/api/health-check', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}