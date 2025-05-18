/**
 * CER Vault Routes
 * 
 * These routes handle document management for Clinical Evaluation Reports:
 * - Document upload and storage
 * - Version management
 * - Diff generation between document versions
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { db } from '../db';
import { diffService } from '../services/diffService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'cer');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// List all files in the vault
router.get('/list', async (req, res) => {
  try {
    const files = await db.query(`
      SELECT id, name, file_path, created_at, size, mime_type
      FROM cer_vault_documents
      ORDER BY created_at DESC
    `);
    
    // Add download URLs to each file
    const filesWithUrls = files.map(file => ({
      ...file,
      downloadUrl: `/api/cer/vault/download/${file.id}`
    }));
    
    res.json({ files: filesWithUrls });
  } catch (err) {
    console.error('Failed to list vault documents:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Import documents into the vault
router.post('/import', upload.array('documents'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Process each uploaded file
    const savedFiles = [];
    
    for (const file of files) {
      const fileId = path.basename(file.filename, path.extname(file.filename));
      
      // Save file metadata to database
      const result = await db.query(`
        INSERT INTO cer_vault_documents (
          id, name, file_path, size, mime_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        fileId,
        file.originalname,
        file.path,
        file.size,
        file.mimetype
      ]);
      
      savedFiles.push({
        id: result[0].id,
        name: file.originalname,
        downloadUrl: `/api/cer/vault/download/${fileId}`
      });
    }
    
    res.status(201).json({ 
      message: 'Files uploaded successfully',
      files: savedFiles
    });
  } catch (err) {
    console.error('Failed to upload files:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Download a document
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file details from database
    const fileResult = await db.query(`
      SELECT file_path, name, mime_type
      FROM cer_vault_documents
      WHERE id = $1
    `, [id]);
    
    if (!fileResult || fileResult.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = fileResult[0];
    
    // Check if file exists
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Failed to download file:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Get versions of a document
router.get('/versions/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get all versions of documents for this job
    const versions = await db.query(`
      SELECT v.version, v.created_at, v.status, d.name
      FROM cer_document_versions v
      JOIN cer_vault_documents d ON v.document_id = d.id
      WHERE v.job_id = $1
      ORDER BY v.version DESC
    `, [jobId]);
    
    res.json({ versions });
  } catch (err) {
    console.error('Failed to get document versions:', err);
    res.status(500).json({ error: 'Failed to get document versions' });
  }
});

// Generate diff between two versions
router.get('/diff/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { v1, v2 } = req.query;
    
    if (!v1 || !v2) {
      return res.status(400).json({ error: 'Missing version parameters' });
    }
    
    // Get document paths for both versions
    const docsResult = await db.query(`
      SELECT v.version, d.file_path
      FROM cer_document_versions v
      JOIN cer_vault_documents d ON v.document_id = d.id
      WHERE v.job_id = $1 AND v.version IN ($2, $3)
    `, [jobId, v1, v2]);
    
    if (docsResult.length !== 2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }
    
    // Find base and compare versions
    const baseDoc = docsResult.find(d => d.version === Number(v1));
    const compareDoc = docsResult.find(d => d.version === Number(v2));
    
    // Generate HTML diff
    const diffHtml = await diffService.generateHtmlDiff(
      baseDoc.file_path,
      compareDoc.file_path
    );
    
    res.json({ diff: diffHtml });
  } catch (err) {
    console.error('Failed to generate diff:', err);
    res.status(500).json({ error: 'Failed to generate diff' });
  }
});

export default router;