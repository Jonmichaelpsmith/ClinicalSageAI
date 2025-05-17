import express from 'express';
import { LearningRepository } from '../../repositories/learningRepository.ts';

const router = express.Router();
const repo = new LearningRepository();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await repo.getDocumentTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by id
router.get('/:id', async (req, res) => {
  try {
    const template = await repo.getDocumentTemplateById(Number(req.params.id));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create template
router.post('/', async (req, res) => {
  try {
    const template = await repo.createDocumentTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const updated = await repo.updateDocumentTemplate(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Get templates by domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const templates = await repo.getDocumentTemplatesByDomain(req.params.domain);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates by domain:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router;
