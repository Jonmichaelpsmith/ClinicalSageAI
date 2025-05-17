// Controller for Co-Author operations
// Provides draft generation and basic section management for the Co-Author module

let sections = [
  { id: '1.1', title: 'Module 1: Admin', x: 50, y: 50, status: 'complete', connections: [] },
  { id: '2.7', title: 'Module 2.7: Clinical Summary', x: 300, y: 50, status: 'critical', connections: ['1.1'] },
  { id: '3.2', title: 'Module 3.2: Clinical Efficacy', x: 550, y: 50, status: 'pending', connections: ['2.7'] }
];

const annotations = {};
const adviceTemplates = {
  '1.1': 'Module 1 requires administrative information including contact details, application forms, and reference lists.',
  '2.7': 'The Clinical Summary should provide a comprehensive analysis of clinical data including efficacy and safety findings.',
  default: 'This section requires thorough documentation following ICH guidelines.'
};

export const generateDraft = (req, res) => {
  try {
    const { moduleId, sectionId, prompt } = req.validatedBody || req.body;
    const draft = `Draft for ${moduleId}/${sectionId}: ${prompt}`;
    res.status(200).json({ success: true, draft });
  } catch (err) {
    console.error('Error generating draft:', err);
    res.status(500).json({ success: false, message: 'Failed to generate draft' });
  }
};

export const getSections = (req, res) => {
  res.json(sections);
};

export const updateSectionLayout = (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  sections = sections.map((sec) => (sec.id === id ? { ...sec, x, y } : sec));
  res.sendStatus(204);
};

export const connectSections = (req, res) => {
  const { fromId, toId } = req.body;
  sections = sections.map((sec) => (sec.id === fromId ? { ...sec, connections: [...sec.connections, toId] } : sec));
  res.sendStatus(204);
};

export const getAnnotation = (req, res) => {
  const { id } = req.params;
  res.json({ notes: annotations[id] || '' });
};

export const saveAnnotation = (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  if (notes) {
    annotations[id] = notes;
    res.sendStatus(204);
  } else {
    res.status(400).json({ error: 'Notes content is required' });
  }
};

export const getAdvice = (req, res) => {
  const { sectionId } = req.body;
  if (!sectionId) {
    return res.status(400).json({ error: 'Section ID is required' });
  }
  const advice = adviceTemplates[sectionId] || adviceTemplates.default;
  const section = sections.find((s) => s.id === sectionId);
  let enhanced = advice;
  if (section && section.status === 'critical') {
    enhanced += ' This section is flagged as critical and requires immediate attention.';
  }
  res.json({ advice: enhanced });
};
