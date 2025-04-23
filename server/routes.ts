import express, { Request, Response } from "express";
import { storage } from "./storage";
import * as http from 'http';

// Load validation API conditionally to maintain stability
let validationApiModule: any;
try {
  validationApiModule = require('./api/validation');
} catch (error: any) {
  console.warn('Validation API module could not be loaded:', error.message);
  validationApiModule = null;
}

export function setupRoutes(app: express.Application): http.Server {
  // Configure middleware
  app.use(express.json());
  
  // Try to load cookie-parser dynamically
  try {
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    console.log('Cookie parser middleware loaded successfully');
  } catch (err) {
    console.warn('Cookie parser middleware not available:', err);
  }
  
  // Register validation API routes only if module is loaded
  if (validationApiModule) {
    console.log('Registering validation API routes');
    app.use("/api/validate", validationApiModule);
  }
  
  // Secure the landing page
  app.get("/api/check-auth", (req: Request, res: Response) => {
    // Safely access cookies with fallback for when cookie-parser is not loaded
    const cookies = (req as any).cookies || {};
    const user = cookies.user ? JSON.parse(cookies.user) : null;
    res.json({ authenticated: !!user, user });
  });
  
  // Simple API routes
  app.get("/api/status", (req: Request, res: Response) => {
    res.json({ 
      status: "operational", 
      version: "1.0.0",
      validation_api: validationApiModule ? "available" : "not_available"
    });
  });
  
  // Return 404 for undefined API routes
  app.use("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ error: "API endpoint not found" });
  });
  
  // Create and return HTTP server
  return http.createServer(app);
}