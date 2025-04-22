import { Router } from "express";
import * as ds from "../services/docushare.js";
import prisma from "../prisma/client.js";

const router = Router();

// GET /api/docs  – list documents
router.get("/docs", async (_req, res, next) => {
  try {
    const docs = await ds.list();
    res.json(docs);
  } catch (err) { next(err); }
});

// POST /api/docs  – upload base64 payload
router.post("/docs", async (req, res, next) => {
  try {
    const { file, name } = req.body;
    const buffer = Buffer.from(file, "base64");
    const hash = await ds.upload(buffer, name);

    await prisma.document.create({
      data: {
        name,
        sha256: hash,
        uploadedBy: req.user?.id ?? 0,
      },
    });
    res.sendStatus(201);
  } catch (err) { next(err); }
});

// POST /api/docushare/webhook  – audit trail sink
router.post("/docushare/webhook", async (req, res, next) => {
  try {
    const ev = req.body; // { objectId, event, actor, timestamp, meta }
    await prisma.audit_log.create({ data: ev });
    res.sendStatus(200);
  } catch (err) { next(err); }
});

// GET /api/audit/export  – csv export for QA
router.get("/audit/export", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`SELECT * FROM audit_log ORDER BY timestamp`;
    res.setHeader("Content-Type", "text/csv");
    res.send([
      "id,objectId,event,actor,timestamp",
      ...rows.map(r => `${r.id},${r.objectid},${r.event},${r.actor},${r.timestamp.toISOString()}`),
    ].join("\n"));
  } catch (err) { next(err); }
});

export default router;