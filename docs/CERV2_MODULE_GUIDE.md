# CERV2 Module Documentation

## IMPORTANT WARNING
**NEVER modify the client-side routing (React Router/Wouter) or the Vite setup**. This can break the entire application and cause unreliable client behavior. Only fix specific issues in the most minimal way possible.

**The JavaScript loading errors should be fixed by properly serving static files**, not by changing how Vite handles routes or any client-side code.

## Overview
The CERV2 module provides an enhanced interface for working with Clinical Evaluation Reports, including QMP integration, compliance checking, and dashboard metrics for tracking objectives and regulatory compliance.

## Key Features
- Interactive CER Builder with section generation
- Quality Management Plan (QMP) integration with ICH E6(R3) compliance 
- Regulatory Traceability Matrix for MDR requirements
- Document Vault for managing supporting documentation
- Equivalence Builder for comparable devices
- State of Art analysis for current medical standards
- FAERS Risk Analysis for FDA adverse event data
- Export functionality for various document formats

## Technical Implementation

### JavaScript Resources
The CERV2 module relies on several JavaScript resources that must be properly served:

- UI component libraries loaded from Vite
- Standalone JavaScript files in `/js` and `/public/js` directories
- Dynamic React components loaded via client-side routing

### Common Issues and Solutions

#### JavaScript Loading Errors
The most common issue with the CERV2 module is JavaScript files being served with HTML content, resulting in "Unexpected token '<'" browser errors.

**Root Causes:**
1. Express middleware order issues - static file handlers coming after catch-all routes
2. Incorrect MIME types being set for JavaScript files
3. Vite returning HTML for JavaScript file requests

**Solutions:**
1. Ensure middleware order follows this pattern:
   ```javascript
   // 1. API routes first
   app.use('/api', apiRoutes);
   
   // 2. Static file middleware before any catch-all
   app.use('/js', express.static(path.join(process.cwd(), 'js'), {
     setHeaders: (res, filePath) => {
       if (path.extname(filePath) === '.js') {
         res.setHeader('Content-Type', 'application/javascript');
       }
     }
   }));
   
   // 3. Specific routes for page serving
   app.get('/', (req, res) => { ... });
   
   // 4. Catch-all for SPA routing
   app.get('*', (req, res, next) => {
     // Don't serve HTML for asset files
     if (/\.(js|css|png|svg|ico|map)$/i.test(req.path)) {
       return res.status(404).end();
     }
     
     // For all other routes, pass to the next handler
     next();
   });
   ```

2. Use the JS loading smoke test to verify proper serving:
   ```bash
   node test/js-loading-test.js
   ```

3. The logging middleware will capture any regressions where JS files are served with HTML content.

## Maintenance and Development

### Adding New Routes
If adding new routes to the Express server, always place them BEFORE the catch-all route to avoid disrupting the JavaScript serving.

### Adding New JavaScript Files
If adding new JavaScript files, place them in the appropriate `/js` or `/public/js` directory and reference them with the correct path.

### Module Debugging
1. First check browser console for any "Unexpected token '<'" errors
2. Verify the response content type for JavaScript files in the Network tab
3. If issues persist, run the JS loading smoke test to identify problems
4. Check server logs for the warning messages from our monitoring middleware

### Prevention
The current setup includes several safeguards:
1. JS File Monitoring Middleware - logs warnings for misconfigured responses
2. Asset Type Detection - prevents catch-all from serving HTML for JS requests
3. Automated test - verifies JS files are served correctly