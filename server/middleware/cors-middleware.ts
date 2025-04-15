/**
 * CORS Middleware for LumenTrialGuide.AI
 * 
 * This middleware handles Cross-Origin Resource Sharing (CORS) configuration
 * for the LumenTrialGuide.AI platform. It's designed to allow controlled access
 * to our API resources while maintaining security standards.
 */

import { RequestHandler } from 'express';

/**
 * Configurable CORS middleware
 * 
 * @returns Express middleware for CORS configuration
 */
export function corsMiddleware(): RequestHandler {
  return (req, res, next) => {
    // Configure appropriate CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Move to the next middleware
    next();
  };
}