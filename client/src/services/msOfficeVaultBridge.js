// msOfficeVaultBridge.js

/**
 * Bridge between the TrialSage Vault API and Microsoft Office Online.
 * Provides helper methods to authenticate with the Vault, load documents in
 * Word Online via Office.js and sync any edits back to the Vault with
 * versioning support.
 */

import { apiRequest } from '../lib/queryClient';
import * as vaultService from './vaultService';
import {
  initializeOfficeJS,
  openWordDocument,
  getDocumentContent
} from './wordIntegration';

// Cached auth token
let vaultToken = null;

/**
 * Authenticate with the Vault API using username/password credentials.
 * The returned token is stored in localStorage for subsequent requests.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} JWT auth token
 */
export async function authenticateVault(username, password) {
  try {
    const res = await apiRequest.post('/api/auth/login', {
      username,
      password
    });
    const { token } = res.data;
    vaultToken = token;
    if (token) {
      localStorage.setItem('vault_jwt', token);
    }
    return token;
  } catch (error) {
    console.error('Vault authentication failed:', error);
    throw error;
  }
}

/**
 * Retrieve the auth token from memory/localStorage.
 */
function getAuthHeader() {
  const token = vaultToken || localStorage.getItem('vault_jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch a document blob from the Vault by ID.
 * @param {string} documentId
 * @returns {Promise<Blob>}
 */
export async function fetchVaultDocument(documentId) {
  return vaultService.downloadDocument(documentId);
}

/**
 * Launch Microsoft Word Online and load the specified Vault document for
 * editing. This will initialise Office.js if needed, download the document
 * and open it in Word Online.
 *
 * @param {string} documentId
 */
export async function launchWordOnline(documentId) {
  await initializeOfficeJS();
  const blob = await fetchVaultDocument(documentId);
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  await openWordDocument(base64);
}

/**
 * Sync the current Word document back to the Vault as a new version.
 * @param {string} documentId
 * @param {Object} [metadata]
 */
export async function syncChangesToVault(documentId, metadata = {}) {
  const html = await getDocumentContent();
  const file = new Blob([html], { type: 'text/html' });
  return vaultService.uploadDocument(file, { ...metadata, documentId });
}

/**
 * Utility: load a document into Word Online by ID.
 * @param {string} documentId
 */
export async function loadWordDocument(documentId) {
  await launchWordOnline(documentId);
}

/**
 * Utility: save the current Word document back to the Vault.
 * @param {string} documentId
 * @param {Object} [metadata]
 */
export async function saveWordDocument(documentId, metadata = {}) {
  return syncChangesToVault(documentId, metadata);
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default {
  authenticateVault,
  fetchVaultDocument,
  launchWordOnline,
  syncChangesToVault,
  loadWordDocument,
  saveWordDocument
};
