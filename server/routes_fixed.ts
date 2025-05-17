/**
 * Fixed routes registration file
 * 
 * This file registers all API routes with the Express application.
 * It provides a central location to add new routes to the application.
 */

import express, { Express, Request, Response } from 'express';
import { router as estar510kRouter } from './routes/510kEstarRoutes';
import cerDeviceProfileRoutes from './routes/cerDeviceProfileRoutes';
import coauthorRoutes from './routes/coauthorRoutes.js';

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
  
  // Set up custom route for FDA510k predicate search manually
  // This is needed because the FDA510kService.js calls '/api/fda510k/predicates'
  app.get('/api/fda510k/predicates', (req: Request, res: Response) => {
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
  console.log('FDA 510(k) Predicate search route registered');

  // Register Co-Author routes for drafting assistance
  app.use('/api/coauthor', coauthorRoutes);
  console.log('Co-Author routes registered');

  // Additional routes can be registered here
}