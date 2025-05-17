/**
 * Microsoft Office to VAULT Bridge Service
 *
 * Provides helper functions for uploading and downloading DOCX files
 * between Microsoft Word Online and the VAULT document store.
 */

/**
 * Download a DOCX file from the VAULT.
 * @param {string} documentId - VAULT document ID
 * @returns {Promise<Blob>} DOCX blob
 */
export async function downloadDocxFromVault(documentId) {
  const response = await fetch(`/api/vault/documents/${documentId}/download?format=docx`);
  if (!response.ok) {
    throw new Error(`Failed to download DOCX: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Upload a DOCX file to the VAULT.
 * @param {File|Blob} file - DOCX file blob
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Upload result
 */
export async function uploadDocxToVault(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file instanceof File ? file : new File([file], metadata.filename || 'document.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch('/api/vault/documents', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload DOCX: ${response.statusText}`);
  }
  return await response.json();
}
