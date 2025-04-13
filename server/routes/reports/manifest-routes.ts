import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

const REPORTS_BASE_DIR = path.join(process.cwd(), "lumen_reports_backend/static/example_reports");

// Get a list of all available report bundles
router.get("/manifest", (req, res) => {
  try {
    const bundles = fs.readdirSync(REPORTS_BASE_DIR)
      .filter(dir => {
        const manifestPath = path.join(REPORTS_BASE_DIR, dir, "manifest.json");
        return fs.existsSync(manifestPath);
      })
      .map(dir => {
        const manifestPath = path.join(REPORTS_BASE_DIR, dir, "manifest.json");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        return {
          id: dir,
          title: manifest.title,
          description: manifest.description,
          includes: manifest.includes
        };
      });
    
    res.json(bundles);
  } catch (error) {
    console.error("Error fetching report bundles:", error);
    res.status(500).json({ error: "Failed to fetch report bundles" });
  }
});

// Get manifest for a specific persona
router.get("/manifest/:personaId", (req, res) => {
  try {
    const { personaId } = req.params;
    const manifestPath = path.join(REPORTS_BASE_DIR, personaId, "manifest.json");
    
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: "Report bundle not found" });
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    res.json(manifest);
  } catch (error) {
    console.error(`Error fetching report bundle for ${req.params.personaId}:`, error);
    res.status(500).json({ error: "Failed to fetch report bundle" });
  }
});

// Download a specific report file
router.get("/download/:personaId/:fileName", (req, res) => {
  try {
    const { personaId, fileName } = req.params;
    const filePath = path.join(REPORTS_BASE_DIR, personaId, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Report file not found" });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error(`Error downloading report file ${req.params.fileName}:`, error);
    res.status(500).json({ error: "Failed to download report file" });
  }
});

export default router;