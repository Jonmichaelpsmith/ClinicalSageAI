/**
 * Critical Route Protector
 * 
 * This utility provides a failsafe mechanism to ensure critical routes never return 404 errors.
 * It attaches special high-priority middleware to the Express app that intercepts requests
 * to critical routes and ensures they are always handled, even if other route handlers fail.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * List of critical routes that must never return 404 errors
 * IMPORTANT: Never remove routes from this list without explicit approval
 */
const CRITICAL_ROUTES = [
  '/client-portal',
  '/client-portal-direct'
];

/**
 * Setup critical route protection on an Express application
 * 
 * @param app Express application instance
 */
export function setupCriticalRouteProtection(app: express.Application): void {
  console.log('🛡️ Setting up Critical Route Protection for vital system paths');
  
  // Add a dedicated, highest-priority middleware for critical routes
  // This middleware runs before any other route handlers
  app.use((req, res, next) => {
    // Only intercept GET requests to critical routes
    if (req.method === 'GET' && CRITICAL_ROUTES.includes(req.path)) {
      console.log(`🔒 Critical route protection activated for: ${req.path}`);
      
      // Get the React app index.html path
      const reactAppPath = path.join(process.cwd(), 'client/public/index.html');
      
      // Serve the React app for this critical route
      if (fs.existsSync(reactAppPath)) {
        // Log for monitoring
        console.log(`✅ Critical route ${req.path} - Serving React app`);
        return res.sendFile(reactAppPath);
      }
      
      // If React app not found, check for static HTML file with matching name
      const staticPath = path.join(process.cwd(), `${req.path.substring(1)}.html`);
      if (fs.existsSync(staticPath)) {
        // Log for monitoring
        console.log(`✅ Critical route ${req.path} - Serving static HTML`);
        return res.sendFile(staticPath);
      }
      
      // Last resort: Generate a fallback response for absolute reliability
      console.log(`⚠️ Critical route ${req.path} - Using generated fallback`);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TrialSage™ ${req.path}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; align-items: center; margin-bottom: 20px; }
            .logo { font-weight: bold; font-size: 24px; color: #ff1493; }
            .badge { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 14px; margin-left: 8px; }
            .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .btn { background: #ff1493; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; }
            .emergency { background: #ff1493; color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TrialSage™</div>
            <div class="badge">${req.path.substring(1)}</div>
          </div>
          
          <div class="emergency">
            <h2>Emergency Fallback Mode</h2>
            <p>The system has detected a potential issue with this route and activated emergency fallback mode for your protection.</p>
          </div>
          
          <div class="card">
            <h3>Available Actions</h3>
            <p>Please choose one of the following options:</p>
            <button class="btn" onclick="window.location.href='/'">Return to Home</button>
            &nbsp;
            <button class="btn" onclick="window.location.reload()">Retry This Page</button>
          </div>
          
          <div class="card">
            <h3>Need Assistance?</h3>
            <p>Please contact the TrialSage support team if this issue persists.</p>
          </div>
          
          <script>
            // Attempt to auto-recover
            setTimeout(() => {
              console.log("Attempting auto-recovery...");
              window.location.reload();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    }
    
    // Pass control to next middleware/route handler for non-critical routes
    next();
  });
  
  console.log('✅ Critical Route Protection successfully initialized');
}