/**
 * Microsoft Office Vault Bridge
 *
 * Provides helper functions for retrieving documents edited in Microsoft Word Online
 * and transferring them back into the TrialSage Vault.
 */
import axios from 'axios';

/**
 * Fetch the updated DOCX file for a document that was edited in Word Online.
 *
 * @param {Object} params
 * @param {string} params.documentId - Identifier for the document in the editing session
 * @param {string} params.accessToken - Access token for Microsoft Graph or WOPI
 * @returns {Promise<Blob>} Updated document blob
 */
export async function fetchUpdatedDocx({ documentId, accessToken }) {
  try {
    const response = await axios.get(
      `/api/microsoft-office/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        responseType: 'blob'
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch updated DOCX from Word Online:', error);
    throw error;
  }
}

export default { fetchUpdatedDocx };
