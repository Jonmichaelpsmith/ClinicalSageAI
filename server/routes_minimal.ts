/**
 * Minimal Routes for TrialSage
 * 
 * This file contains essential routes to get the application running
 * without triggering the path-to-regexp errors
 */

import { Express } from 'express';

export default function registerBasicRoutes(app: Express) {
  // Basic API routes
  app.get('/api/portal/status', (req, res) => {
    res.json({
      status: 'operational',
      message: 'TrialSage portal is running',
      timestamp: new Date().toISOString()
    });
  });

  // Client portal redirect
  app.get('/client-portal', (req, res) => {
    res.redirect('/');
  });

  console.log('Basic routes registered successfully');
  return app;
}