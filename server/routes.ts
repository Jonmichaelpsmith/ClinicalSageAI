import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Mock compliance data for the demo
const complianceData = {
  id: "comp-001",
  title: "Regulatory Compliance Platform",
  status: "active",
  lastUpdated: "2023-06-15",
  modules: [
    { id: "mod-001", name: "510(k) Submission", status: "active", type: "submission" },
    { id: "mod-002", name: "PMA Application", status: "pending", type: "submission" },
    { id: "mod-003", name: "Quality Management System", status: "active", type: "quality" },
    { id: "mod-004", name: "CAPA Management", status: "active", type: "quality" },
    { id: "mod-005", name: "Document Control", status: "active", type: "quality" },
    { id: "mod-006", name: "Audit Management", status: "pending", type: "quality" },
    { id: "mod-007", name: "De Novo Request", status: "pending", type: "submission" },
    { id: "mod-008", name: "HDE Application", status: "active", type: "submission" }
  ]
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  app.get("/api/compliance/current", (req, res) => {
    res.json(complianceData);
  });

  app.get("/api/compliance/:id", (req, res) => {
    const moduleId = req.params.id;
    const module = complianceData.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    
    res.json(module);
  });

  // Additional routes could be added here for other parts of the application
  
  const httpServer = createServer(app);
  return httpServer;
}
