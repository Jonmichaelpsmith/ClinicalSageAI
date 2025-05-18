import { Express } from 'express';

/**
 * Register minimal routes with the Express application
 * This is a reduced version to avoid path-to-regexp errors
 * 
 * @param app Express application instance
 */
export default function registerMinimalRoutes(app: Express): void {
  // Simple health check route
  app.get('/api/health-minimal', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: 'minimal-routes'
    });
  });
}