// /server/routes/vault.js

import express from 'express';
import * as vaultController from '../controllers/vaultController.js';

const router = express.Router();

// GET /api/vault/recent-docs - Get recent documents for the current user
router.get('/recent-docs', vaultController.getRecentDocuments);

// GET /api/vault/documents/:id - Get a specific document by ID
router.get('/documents/:id', vaultController.getDocumentById);

// GET /api/vault/documents - Get all documents (with optional filtering)
router.get('/documents', vaultController.getAllDocuments);

// POST /api/vault/documents - Create a new document
router.post('/documents', vaultController.createDocument);

// PUT /api/vault/documents/:id - Update an existing document
router.put('/documents/:id', vaultController.updateDocument);

// DELETE /api/vault/documents/:id - Delete a document
router.delete('/documents/:id', vaultController.deleteDocument);

export default router;