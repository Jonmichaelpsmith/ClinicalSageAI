/**
 * Reference Model API Routes
 * Handles API endpoints for the Veeva-style document reference model
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyJwt } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Apply JWT authentication to all routes
router.use(verifyJwt);

/**
 * Get all document types
 */
router.get('/document-types', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('document_types')
      .select('*')
      .order('display_order');

    if (error) throw error;
    
    return res.json(data);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching document types');
    return res.status(500).json({ 
      error: 'Failed to fetch document types', 
      details: error.message 
    });
  }
});

/**
 * Get document subtypes, optionally filtered by type_id
 */
router.get('/document-subtypes', async (req, res) => {
  try {
    const { type_id } = req.query;
    
    let query = supabase
      .from('document_subtypes')
      .select(`
        *,
        document_types:type_id (*),
        lifecycle:lifecycle_id (*)
      `)
      .order('display_order');
    
    // Filter by type_id if provided
    if (type_id) {
      query = query.eq('type_id', type_id);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    return res.json(data);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching document subtypes');
    return res.status(500).json({ 
      error: 'Failed to fetch document subtypes', 
      details: error.message 
    });
  }
});

/**
 * Get all available lifecycles
 */
router.get('/lifecycles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lifecycles')
      .select('*');

    if (error) throw error;
    
    return res.json(data);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching lifecycles');
    return res.status(500).json({ 
      error: 'Failed to fetch lifecycles', 
      details: error.message 
    });
  }
});

/**
 * Get folder templates for document hierarchy
 */
router.get('/folder-templates', async (req, res) => {
  try {
    const { parent_id } = req.query;
    
    let query = supabase
      .from('folder_templates')
      .select(`
        *,
        document_types:document_type_id (*)
      `);
    
    // Filter by parent_id if provided
    if (parent_id) {
      if (parent_id === 'null') {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parent_id);
      }
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    return res.json(data);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching folder templates');
    return res.status(500).json({ 
      error: 'Failed to fetch folder templates', 
      details: error.message 
    });
  }
});

/**
 * Get retention schedule for a document
 */
router.get('/document-retention/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document with its subtype info
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        document_subtype_id,
        periodic_review_date,
        archive_date,
        delete_date,
        document_subtypes:document_subtype_id (
          *,
          document_types:type_id (name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // If document has no subtype, return basic info
    if (!document.document_subtypes) {
      return res.json({
        id: document.id,
        title: document.title,
        has_retention_schedule: false,
        message: 'Document does not have retention schedule information'
      });
    }
    
    // Return document with its retention schedule
    return res.json({
      id: document.id,
      title: document.title,
      document_type: document.document_subtypes.document_types.name,
      document_subtype: document.document_subtypes.name,
      has_retention_schedule: true,
      review_interval: document.document_subtypes.review_interval,
      archive_after: document.document_subtypes.archive_after,
      delete_after: document.document_subtypes.delete_after,
      periodic_review_date: document.periodic_review_date,
      archive_date: document.archive_date,
      delete_date: document.delete_date
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching document retention');
    return res.status(500).json({ 
      error: 'Failed to fetch document retention', 
      details: error.message 
    });
  }
});

/**
 * Initialize top-level folders based on the reference model
 */
router.post('/initialize-folders', async (req, res) => {
  try {
    // Check if folders already exist
    const { data: existingFolders, error: checkError } = await supabase
      .from('folders')
      .select('name')
      .in('name', ['Governance & Procedures', 'Operations', 'Forms', 'Executed Records']);
    
    if (checkError) throw checkError;
    
    // If all top-level folders already exist, return success
    if (existingFolders.length === 4) {
      return res.json({
        success: true,
        message: 'Folder structure already initialized',
        folders: existingFolders
      });
    }
    
    // Get folder templates
    const { data: templates, error: templatesError } = await supabase
      .from('folder_templates')
      .select('*')
      .is('parent_id', null)
      .eq('default_for_tenants', true);
    
    if (templatesError) throw templatesError;
    
    // Create folders that don't exist yet
    const existingNames = existingFolders.map(f => f.name);
    const foldersToCreate = templates.filter(t => !existingNames.includes(t.name));
    
    const createdFolders = [];
    
    for (const template of foldersToCreate) {
      const { data: folder, error: createError } = await supabase
        .from('folders')
        .insert({
          name: template.name,
          description: template.description,
          document_type_id: template.document_type_id
        })
        .select()
        .single();
      
      if (createError) {
        logger.error({ err: createError }, `Error creating folder: ${template.name}`);
        continue;
      }
      
      createdFolders.push(folder);
    }
    
    return res.json({
      success: true,
      message: `Created ${createdFolders.length} top-level folders`,
      folders: createdFolders
    });
  } catch (error) {
    logger.error({ err: error }, 'Error initializing folders');
    return res.status(500).json({ 
      error: 'Failed to initialize folders', 
      details: error.message 
    });
  }
});

/**
 * Get document training requirements
 */
router.get('/document-training/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document with its subtype info
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        document_subtype_id,
        document_subtypes:document_subtype_id (
          *,
          document_types:type_id (name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // If document has no subtype, or doesn't require training
    if (!document.document_subtypes || !document.document_subtypes.requires_training) {
      return res.json({
        id: document.id,
        title: document.title,
        requires_training: false
      });
    }
    
    // Get training records for this document
    const { data: trainingRecords, error: trainingError } = await supabase
      .from('training_records')
      .select(`
        id,
        status,
        completed_at,
        user_id,
        users:user_id (name, email)
      `)
      .eq('document_id', id);
    
    if (trainingError) throw trainingError;
    
    // Return document with its training requirements
    return res.json({
      id: document.id,
      title: document.title,
      document_type: document.document_subtypes.document_types.name,
      document_subtype: document.document_subtypes.name,
      requires_training: true,
      training_records: trainingRecords || []
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching document training requirements');
    return res.status(500).json({ 
      error: 'Failed to fetch document training requirements', 
      details: error.message 
    });
  }
});

/**
 * Get periodic review tasks
 */
router.get('/review-tasks', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    
    // Get review tasks for this tenant
    const { data: tasks, error } = await supabase
      .from('periodic_review_tasks')
      .select(`
        id,
        document_id,
        due_date,
        status,
        comments,
        created_at,
        updated_at,
        documents:document_id (
          id,
          title,
          document_subtype_id,
          document_subtypes:document_subtype_id (
            id,
            name,
            document_types:type_id (
              id,
              name
            )
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    return res.json(tasks || []);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching periodic review tasks');
    return res.status(500).json({ 
      error: 'Failed to fetch periodic review tasks', 
      details: error.message 
    });
  }
});

/**
 * Complete a periodic review task
 */
router.post('/complete-review/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const userId = req.user?.id;
    
    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('periodic_review_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (taskError) throw taskError;
    
    if (!task) {
      return res.status(404).json({ error: 'Review task not found' });
    }
    
    // Update task to completed
    const { error: updateError } = await supabase
      .from('periodic_review_tasks')
      .update({
        status: 'Completed',
        comments: comments || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Schedule next review if applicable
    try {
      // Get the document information
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('id, document_subtype_id, created_by, tenant_id')
        .eq('id', task.document_id)
        .single();
      
      if (!documentError && document) {
        // Import the scheduler function
        const { scheduleNextReview } = await import('../jobs/periodicReview.js');
        
        // Schedule the next review
        await scheduleNextReview(
          document.id,
          document.document_subtype_id,
          document.created_by || userId,
          document.tenant_id
        );
      }
    } catch (scheduleError) {
      // Log but don't fail the request
      logger.error({ err: scheduleError }, 'Error scheduling next review');
    }
    
    res.json({ 
      success: true, 
      message: 'Review completed successfully' 
    });
  } catch (error) {
    logger.error({ err: error }, 'Error completing periodic review');
    return res.status(500).json({ 
      error: 'Failed to complete review', 
      details: error.message 
    });
  }
});

export default router;