import { Router } from 'express';
import * as ds from '../services/docushare.js';
import prisma from '../prisma/client.js';

const r = Router();

// list
r.get('/docs', async (req, res) => {
  res.json(await ds.list());
});

// upload
r.post('/docs', async (req, res) => {
  const buf = Buffer.from(req.body.file, 'base64');
  const hash = await ds.upload(buf, req.body.name);
  await prisma.document.create({
    data: { name: req.body.name, sha256: hash, uploadedBy: req.user.id }
  });
  res.sendStatus(201);
});

// webhook - audit events
r.post('/docushare/webhook', async (req, res) => {
  const ev = req.body;                       // see API docs for exact shape
  await prisma.audit_log.create({ data: ev });
  res.sendStatus(200);
});

// audit-export endpoint
r.get('/audit/export', async (_, res) => {
  const rows = await prisma.$queryRaw`SELECT * FROM audit_log ORDER BY timestamp`;
  // simple CSV
  res.setHeader('Content-Type', 'text/csv');
  res.send(
    ['id,objectId,event,actor,timestamp']
      .concat(rows.map(r => `${r.id},${r.objectId},${r.event},${r.actor},${r.timestamp.toISOString()}`))
      .join('\n')
  );
});

export default r;