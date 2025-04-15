import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleDataUpdates, findLatestDataFile, importTrialsFromJson } from "./data-importer";

// Create a simplified Express app for faster startup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });

  next();
});

(async () => {
  try {
    // Add a quick health-check endpoint that will respond immediately
    app.get('/__health', (_req, res) => {
      res.status(200).json({ status: 'ok', message: 'LumenTrialGuide.AI server is running' });
    });

    // Create a simple HTTP server first
    const http = await import('http');
    const server = http.createServer(app);
    
    // Server configuration
    const port = 5000;
    log(`Starting minimal server on port ${port}...`);
    
    // Listen to the port immediately to satisfy the port check
    server.listen(port, "0.0.0.0", () => {
      log(`✅ Server successfully bound to port ${port}`);
      
      // Now that the port is bound, continue with the full initialization
      process.nextTick(async () => {
        try {
          log('Continuing with full server initialization...');
          
          // Register all API routes
          await registerRoutes(app);
          log('Routes registered successfully');
          
          // Add error handling middleware
          app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            
            log(`Error middleware triggered: ${err.message || 'Unknown error'}`);
            res.status(status).json({ message });
          });
          
          // Setup Vite or static serving
          if (app.get("env") === "development") {
            log('Setting up Vite for development...');
            await setupVite(app, server);
            log('Vite setup completed');
          } else {
            log('Setting up static file serving...');
            serveStatic(app);
            log('Static file serving setup completed');
          }
          
          // Start background tasks
          log('Starting clinical trial data updater...');
          const dataUpdateTimer = scheduleDataUpdates(12); // Update every 12 hours
          
          // Handle server shutdown
          process.on('SIGTERM', () => {
            log('SIGTERM signal received: closing data updater');
            clearInterval(dataUpdateTimer);
            server.close(() => {
              log('HTTP server closed');
            });
          });
        } catch (e) {
          log(`❌ Error during full initialization: ${e instanceof Error ? e.message : String(e)}`);
          console.error('Server initialization error:', e);
        }
      });
    });
    
    // Add event handlers for the server to catch any issues
    server.on('error', (err) => {
      log(`Server error: ${err.message}`);
      console.error('Server failed to start:', err);
    });
  } catch (error) {
    log(`❌ Caught error during server initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Server initialization failed:', error);
  }
})();
