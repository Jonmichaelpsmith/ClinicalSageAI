/**
 * Quality Management Routes Integration
 * 
 * This file registers the quality management API routes with the Express application.
 */
import express from 'express';
import qualityManagementApi from './quality-management-api';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('quality-management-routes');

/**
 * Register quality management routes with the Express application
 * 
 * @param app Express application instance
 */
export function registerQualityManagementRoutes(app: express.Application): void {
  try {
    logger.info('Registering quality management API routes');
    
    // Mount the quality management API at /api/quality
    app.use('/api/quality', qualityManagementApi);
    
    logger.info('Quality management API routes registered successfully');
  } catch (error) {
    logger.error('Failed to register quality management API routes', { error });
    throw error;
  }
}

export default registerQualityManagementRoutes;