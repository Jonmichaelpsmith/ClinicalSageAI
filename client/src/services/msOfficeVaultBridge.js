import * as vaultService from './vaultService';

/**
 * Download a DOCX file from the VAULT.
 * @param {string} documentId
 * @returns {Promise<Blob>} DOCX blob
 */
export async function downloadDocx(documentId) {
  try {
    return await vaultService.downloadDocument(documentId);
  } catch (error) {
    console.error('Error downloading DOCX from VAULT:', error);
    throw error;
  }
}

/**
 * Upload a DOCX file to the VAULT.
 * @param {File|Blob} file - DOCX content
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Upload result
 */
export async function uploadDocx(file, metadata = {}) {
  try {
    let uploadFile = file;
    if (!(file instanceof File)) {
      uploadFile = new File([file], metadata.fileName || 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    }

    return await vaultService.uploadDocument(uploadFile, {
      ...metadata,
      format: 'docx',
    });
  } catch (error) {
    console.error('Error uploading DOCX to VAULT:', error);
    throw error;
  }
}
