/**
 * Fixed routes registration file
 * 
 * This file registers all API routes with the Express application.
 * It provides a central location to add new routes to the application.
 */

import { Express } from 'express';
import { router as estar510kRouter } from './routes/510kEstarRoutes';
import cerDeviceProfileRoutes from './routes/cerDeviceProfileRoutes';

/**
 * Register all routes with the Express application
 * 
 * @param app Express application instance
 */
export default function registerRoutes(app: Express): void {
  // Register FDA 510k eSTAR routes
  app.use('/api/fda510k/estar', estar510kRouter);
  
  // Register CER device profile routes
  app.use('/api/cer/device-profile', cerDeviceProfileRoutes);
  console.log('CER Device Profile routes registered');
  
  // Additional routes can be registered here
}