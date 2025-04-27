import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import OpenAI from 'openai';
import { runQuery } from '../utils/sqlGuard.js';
import db from '../db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = Router();

// SYSTEM prompt – inject schema + examples
const schema = `Tables:
 programs(id,name)
 studies(id,name,program_id,phase)
 documents(id,study_id,filename,mime_type)
 subject_data(study_id,subject_id,visit,ae_grade)
`;

/* ---------- SSE stream helper ---------- */
function sseInit(res) {
  res.writeHead(200, { 
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive' 
  });
  res.write('\n');
}

function sseSend(res, event, data) { 
  res.write(`event:${event}\ndata:${JSON.stringify(data)}\n\n`); 
}

// GET /api/analytics/dashboards - list all dashboards for the organization
r.get('/analytics/dashboards', requireAuth, async (req, res) => {
  try {
    const dashboards = await db('dashboards')
      .select('*')
      .where('organization_id', req.user.orgId)
      .orderBy('created_at', 'desc');
    
    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ message: 'Failed to fetch dashboards' });
  }
});

// GET /api/analytics/dashboards/:id - get a specific dashboard
r.get('/analytics/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const [dashboard] = await db('dashboards')
      .select('*')
      .where({
        id: req.params.id,
        organization_id: req.user.orgId
      });
    
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
});

// POST /api/analytics/chat – SSE stream
r.post('/analytics/chat', requireAuth, async (req, res) => {
  const { prompt, studyId } = req.body;
  if (!prompt) return res.status(400).json({ message: 'prompt required' });
  
  sseInit(res);
  
  const messages = [
    { role: 'system', content: `You are TrialSage BI assistant. Return JSON { sql, vega, plainText } if chart, OR { plainText } for narrative. ${schema}` },
    { role: 'user', content: prompt }
  ];
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      response_format: { type: 'json_object' },
      messages,
      functions: [{ 
        name: 'execute_sql', 
        description: 'Run SQL and return rows', 
        parameters: { 
          type: 'object', 
          properties: { 
            sql: { type: 'string' } 
          } 
        } 
      }]
    });
    
    let resultObj = {};
    let buf = '';
    
    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) { 
        buf += chunk.choices[0].delta.content; 
      }
      if (chunk.choices?.[0]?.finish_reason === 'stop') {
        resultObj = JSON.parse(buf);
      }
    }
    
    if (resultObj.sql) {
      try {
        const rows = await runQuery(resultObj.sql);
        sseSend(res, 'rows', rows);
        sseSend(res, 'vega', resultObj.vega || null);
      } catch (qErr) {
        // self-repair attempt
        const fix = await openai.chat.completions.create({ 
          model: 'gpt-4o-mini', 
          messages: [{ role: 'system', content: `SQL error: ${qErr.message}. Provide fixed SELECT.` }], 
          response_format: { type: 'json_object' } 
        });
        const fixObj = JSON.parse(fix.choices[0].message.content);
        const rows = await runQuery(fixObj.sql);
        sseSend(res, 'rows', rows);
        sseSend(res, 'vega', fixObj.vega || null);
      }
    }
    
    if (resultObj.plainText) sseSend(res, 'text', resultObj.plainText);
    sseSend(res, 'done', {});
    res.end();
  } catch (err) { 
    console.error(err); 
    sseSend(res, 'error', { message: err.message }); 
    res.end(); 
  }
});

// POST /api/analytics/save – save dashboard
r.post('/analytics/save', requireAuth, async (req, res) => {
  try {
    const { title, vega_spec } = req.body;
    
    if (!title || !vega_spec) {
      return res.status(400).json({ message: 'Title and visualization spec required' });
    }
    
    const [dashboard] = await db('dashboards').insert({ 
      title, 
      vega_spec, 
      organization_id: req.user.orgId, 
      created_by: req.user.id 
    }).returning('*');
    
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Error saving dashboard:', error);
    res.status(500).json({ message: 'Failed to save dashboard' });
  }
});

// DELETE /api/analytics/dashboards/:id - delete a dashboard
r.delete('/analytics/dashboards/:id', requireAuth, async (req, res) => {
  try {
    // Verify ownership before deletion
    const [dashboard] = await db('dashboards')
      .select('id')
      .where({
        id: req.params.id,
        organization_id: req.user.orgId
      });
    
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }
    
    await db('dashboards')
      .where('id', req.params.id)
      .delete();
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ message: 'Failed to delete dashboard' });
  }
});

export default r;