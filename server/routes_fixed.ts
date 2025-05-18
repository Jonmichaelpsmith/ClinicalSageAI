/**
 * Simplified routes registration file
 * 
 * This file registers basic routes with the Express application.
 * It's a simplified version to get the app running.
 */

import express, { Express, Request, Response } from 'express';

/**
 * Register essential routes with the Express application
 * 
 * @param app Express application instance
 */
export default function registerRoutes(app: Express): void {
  // Set up a basic health check route
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Set up custom route for FDA510k predicate search manually
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
}