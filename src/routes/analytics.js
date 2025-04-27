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
  const { title, vega_spec } = req.body;
  const [d] = await db('dashboards').insert({ 
    title, 
    vega_spec, 
    organization_id: req.user.orgId, 
    created_by: req.user.id 
  }).returning('*');
  
  res.status(201).json(d);
});

export default r;