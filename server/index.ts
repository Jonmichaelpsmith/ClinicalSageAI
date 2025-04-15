import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleDataUpdates, findLatestDataFile, importTrialsFromJson } from "./data-importer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log('Starting server initialization...');
    const server = await registerRoutes(app);
    log('Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`Error middleware triggered: ${err.message || 'Unknown error'}`);
      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      log('Setting up Vite for development...');
      await setupVite(app, server);
      log('Vite setup completed');
    } else {
      log('Setting up static file serving...');
      serveStatic(app);
      log('Static file serving setup completed');
    }

    // Server configuration
    // Changed to port 5000 to match Replit's expected port
    // The Python API service runs on port 8000
    const port = 5000;
    log(`Attempting to listen on port ${port}...`);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✅ Server successfully started and serving on port ${port}`);
      
      // Start the clinical trial data updater
      log('Starting clinical trial data updater...');
      const dataUpdateTimer = scheduleDataUpdates(12); // Update every 12 hours
      
      // Check if we have any data already
      const latestJsonFile = findLatestDataFile('json');
      if (latestJsonFile) {
        log(`Found existing data file: ${latestJsonFile}, importing...`);
        importTrialsFromJson(latestJsonFile)
          .then(result => {
            log(`Data import result: ${result.message}`);
          })
          .catch(error => {
            log(`Error importing data: ${error.message}`);
          });
      }
      
      // Handle server shutdown
      process.on('SIGTERM', () => {
        log('SIGTERM signal received: closing data updater');
        clearInterval(dataUpdateTimer);
        server.close(() => {
          log('HTTP server closed');
        });
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
