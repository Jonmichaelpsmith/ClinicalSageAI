import express, { Request, Response } from "express";
import { storage } from "./storage";
import validationApi from "./api/validation";
import cookieParser from "cookie-parser";

export function setupRoutes(app: express.Application) {
  // Configure middleware
  app.use(express.json());
  app.use(cookieParser());
  
  // Register validation API routes
  app.use("/api/validate", validationApi);
  
  // Secure the landing page
  app.get("/api/check-auth", (req: Request, res: Response) => {
    const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.json({ authenticated: !!user, user });
  });
  
  // Simple API routes
  app.get("/api/status", (req: Request, res: Response) => {
    res.json({ status: "operational", version: "1.0.0" });
  });
  
  // Return 404 for undefined API routes
  app.use("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ error: "API endpoint not found" });
  });
}