import { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";

export function registerSubscriptionsRoutes(app: Express) {
  // Get list of all available subscription report bundles
  app.get("/api/reports/subscriptions", async (_req: Request, res: Response) => {
    try {
      const indexPath = path.resolve(process.cwd(), "lumen_reports_backend/static/example_reports/report_index.json");
      
      if (!fs.existsSync(indexPath)) {
        return res.status(404).json({ error: "Report index not found" });
      }
      
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      return res.status(200).json(indexData);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      return res.status(500).json({ error: "Failed to fetch subscription data" });
    }
  });

  // Download a specific report file
  app.get("/api/reports/download/:persona/:filename", async (req: Request, res: Response) => {
    try {
      const { persona, filename } = req.params;
      const filePath = path.resolve(process.cwd(), `lumen_reports_backend/static/example_reports/${persona}/${filename}`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Report file not found" });
      }
      
      // Set appropriate content type based on file extension
      const extension = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case '.pptx':
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading report:", error);
      return res.status(500).json({ error: "Failed to download report" });
    }
  });
}