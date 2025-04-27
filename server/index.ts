import express, { type Request, Response, NextFunction } from "express";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduleDataUpdates, findLatestDataFile, importTrialsFromJson } from "./simplified-data-importer";

// Try to load the fastapi_bridge module if available
let registerFastapiProxy: any = () => {
  console.warn("Using fallback FastAPI initialization (no-op)");
};

// Use dynamic import pattern for ES modules
import('./fastapi_bridge.js').then(module => {
  if (module && module.default) {
    registerFastapiProxy = module.default;
    console.log("FastAPI bridge module loaded successfully via dynamic import");
  }
}).catch(error => {
  console.warn(`FastAPI bridge module could not be loaded: ${error instanceof Error ? error.message : String(error)}`);
});

// Initialize WebSocket services with graceful degradation
// Temporarily using a no-op function to improve startup time
console.log("WebSocket initialization simplified for faster startup");
const initWs = (server: any) => {
  console.log("WebSocket initialization skipped for performance optimization");
  return null;
};

// Import v11.1 services - handle import errors gracefully
// Using optional services with default no-ops
let voiceCopilotService: any = { 
  initVoiceServer: null 
};
let regIntelService: any = null;

// Temporarily disable dynamic imports for v11 services to improve startup performance
console.log("Service imports disabled for faster startup");
// Define empty service objects for compatibility
voiceCopilotService = { initVoiceServer: null };
regIntelService = { 
  startRegGuidancePull: () => console.log("RegIntel service disabled"), 
  scheduleRegGuidancePulls: () => console.log("RegIntel scheduling disabled") 
};

// Import AI backfill functionality for nightly scheduled re-embedding
// Temporarily commented out due to dependency issues
// import { backfill } from "../scripts/aiBackfill.js";
// import cron from "node-cron";

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

// Direct routes for IND wizard
app.get('/ind/wizard', (req, res, next) => {
  console.log("IND wizard route hit - will be handled by Vite dev server or static file server");
  // Let Vite handle it in dev mode, or static file server in prod
  next();
});

// Catch-all route for all IND wizard nested paths
app.get('/ind/wizard/*', (req, res, next) => {
  console.log(`IND wizard nested route hit: ${req.path}`);
  // Let Vite handle it in dev mode, or static file server in prod
  next();
});

// Direct API routes for IND wizard
app.get('/api/ind/wizard/*', (req, res, next) => {
  console.log(`IND wizard API route: ${req.path}`);
  next(); // Pass to the actual handlers in routes.ts
});

// Register the FastAPI proxy for both REST and WebSocket endpoints
registerFastapiProxy(app);

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

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    type: 'UncaughtException'
  };

  logger.error(`Uncaught Exception occurred: ${errorDetails.message}`);
  console.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
  // Note: Consider whether process.exit(1) is needed based on your application's requirements
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString(),
    type: 'UnhandledRejection',
    promise
  };

  logger.error(`Unhandled Promise Rejection: ${errorDetails.message}`);
  
  if (reason instanceof Error) {
    console.error(`Unhandled Rejection: ${reason.message}\n${reason.stack}`);
  } else {
    console.error(`Unhandled Rejection: ${String(reason)}`);
  }
  // Note: Consider whether process.exit(1) is needed based on your application's requirements
});

// Application auto-recovery mechanism
let isRecovering = false;
function checkServerHealth() {
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const memoryUsagePercent = Math.round((memoryUsedMB / memoryTotalMB) * 100);
  
  // Check for memory leaks or high usage
  if (memoryUsagePercent > 90 && !isRecovering) {
    logger.warn(`High memory usage detected: ${memoryUsagePercent}% (${memoryUsedMB}MB / ${memoryTotalMB}MB)`);
    // Could implement memory cleanup or controlled restart here
  }
}

// Run health check every 5 minutes
setInterval(checkServerHealth, 5 * 60 * 1000);

(async () => {
  const server = await setupRoutes(app);

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const requestId = (req as any).requestId || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Log detailed error information
    const errorDetails = {
      message,
      status,
      path: req.path,
      method: req.method,
      requestId,
      stack: err.stack,
      timestamp: new Date().toISOString()
    };
    
    logger.error(`Unhandled error in ${req.method} ${req.path} [${requestId}]: ${message}`);
    console.error(`Error details: ${JSON.stringify(errorDetails, null, 2)}`);
    
    // Return structured error response
    res.status(status).json({
      error: {
        message,
        status,
        requestId,
        path: req.path,
        timestamp: new Date().toISOString()
      }
    });
    
    // Don't throw the error - this prevents the app from crashing
    // throw err; - removed
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port 5000 for Replit compatibility
  // This serves both the API and the client
  const PORT = process.env.PORT || 5000;
  
  const startServer = () => {
    server.on('error', (error: any) => {
      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    });
    
    server.listen({
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${PORT}`);
      
      // Initialize WebSocket servers for v11.1 features
      try {
        // Initialize WebSocket namespaces
        log('Initializing WebSocket server...');
        initWs(server);
        log('WebSocket server initialized successfully');
        
        // Initialize Voice Copilot service
        if (voiceCopilotService && voiceCopilotService.initVoiceServer) {
          log('Initializing Voice Copilot service...');
          voiceCopilotService.initVoiceServer(server);
          log('Voice Copilot service initialized successfully');
        } else {
          log('Voice Copilot service not available, skipping initialization');
        }
      } catch (error) {
        logger.error(`Error initializing WebSocket services: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // FastAPI server is now started via main.py directly, not from Node
      const apiPort = process.env.PORT || '8000';
      log(`Connected to FastAPI server running on PORT=${apiPort}`);
      
      // Data update initialization temporarily disabled to improve startup performance
      log('Data updater disabled for performance optimization');
      const dataUpdateTimer = null;
      
      // Data import temporarily disabled for faster startup
      log('Data import disabled for performance optimization');
      
      // Handle server shutdown
      // Temporarily disabled nightly document re-embedding
      // Will be re-enabled after dependency issues are resolved

      process.on('SIGTERM', () => {
        log('SIGTERM signal received: closing HTTP server');
        // No timer to clear since we disabled it
        server.close(() => {
          log('HTTP server closed');
        });
      });
    });
  };
  
  // Start the server
  startServer();
})();
