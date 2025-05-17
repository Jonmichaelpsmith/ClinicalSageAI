/**
 * Microsoft Office to Vault Bridge
 *
 * Provides helper methods for saving Word documents
 * to the TrialSage Vault backend.
 */
import { apiRequest } from '../lib/queryClient';

class MsOfficeVaultBridge {
  /**
   * Upload a DOCX file to the vault
   * @param {File} file Word file
   * @param {Object} metadata optional metadata
   */
  async saveDocx(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    const res = await apiRequest.post('/api/vault/documents/word', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }

  /**
   * Retrieve a DOCX file from the vault
   * @param {string} documentId Document identifier
   */
  async getDocx(documentId) {
    const res = await apiRequest.get(`/api/vault/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  }
}

const msOfficeVaultBridge = new MsOfficeVaultBridge();
export default msOfficeVaultBridge;

