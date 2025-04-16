import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleDataUpdates, findLatestDataFile, importTrialsFromJson } from "./data-importer";

// Create a logger utility for consistent formatting
const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware with timestamp-based IDs
app.use((req, res, next) => {
  // Generate a timestamp-based ID with random suffix
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const requestId = `${timestamp}-${randomSuffix}`;
  
  const start = timestamp;
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Add requestId to the request object for use in other middlewares/routes
  (req as any).requestId = requestId;
  
  // Log request start
  logger.info(`Request ${requestId} - START: ${req.method} ${path} (${req.ip})`);

  // Capture the response JSON for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log when the response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    let logLine = `Request ${requestId} - END: ${req.method} ${path} - Status: ${statusCode} - ${duration}ms`;
    
    // Only include response body for API endpoints and when appropriate
    if (path.startsWith("/api") && capturedJsonResponse && logLevel !== 'error') {
      // For non-error responses, limit the response logging to avoid overwhelming logs
      const responseStr = JSON.stringify(capturedJsonResponse);
      if (responseStr.length > 100) {
        logLine += ` :: ${responseStr.slice(0, 100)}...`;
      } else {
        logLine += ` :: ${responseStr}`;
      }
    }
    
    // For errors, log the full response
    if (logLevel === 'error' && capturedJsonResponse) {
      logger.error(`Response body for ${requestId}: ${JSON.stringify(capturedJsonResponse)}`);
    }
    
    logger[logLevel](logLine);
    
    // Also log to Vite's log function for development visibility
    log(`${req.method} ${path} ${statusCode} in ${duration}ms`);
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to use port 5000, but use another if it's already in use
  // This serves both the API and the client
  let port = 5000;
  const MAX_PORT_ATTEMPTS = 10;
  
  const startServer = (attemptNumber = 0) => {
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE' && attemptNumber < MAX_PORT_ATTEMPTS) {
        port = port + 1;
        log(`Port ${port-1} in use, trying port ${port}...`);
        startServer(attemptNumber + 1);
      } else {
        logger.error(`Server error: ${error.message}`);
        process.exit(1);
      }
    });
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      
      // Start the clinical trial data updater
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
  };
  
  // Start the server
  startServer();
})();
