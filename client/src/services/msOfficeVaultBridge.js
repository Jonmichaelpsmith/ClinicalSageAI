import { downloadDocument, uploadDocument } from './vaultService';

/**
 * Download a DOCX file from the VAULT and return a blob URL for Word Online.
 * @param {string} documentId
 * @returns {Promise<{url: string, blob: Blob}>}
 */
export async function openDocx(documentId) {
  const blob = await downloadDocument(documentId);
  const url = URL.createObjectURL(blob);
  return { url, blob };
}

/**
 * Upload an updated DOCX blob back to the VAULT.
 * @param {Blob} blob
 * @param {Object} metadata
 * @returns {Promise<Object>}
 */
export async function saveDocx(blob, metadata = {}) {
  const file = new File([blob], metadata.fileName || 'document.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  return uploadDocument(file, metadata);
}
