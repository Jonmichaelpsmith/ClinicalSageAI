import { useState } from 'react';
import axios from 'axios';

/**
 * Custom hook for exporting FAERS data to different formats
 * 
 * @returns {Object} - Export methods and state
 */
export function useExportFAERS() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  /**
   * Export FAERS data to PDF
   * 
   * @param {Object} faersData - FAERS data to export
   * @param {Object} options - Export options
   */
  const exportToPDF = async (faersData, options = {}) => {
    if (!faersData) {
      setExportError('No FAERS data to export');
      return null;
    }

    setExporting(true);
    setExportError(null);

    try {
      const response = await axios.post('/api/cer/faers/export', {
        faersData,
        format: 'pdf',
        options
      });

      setLastExport({
        format: 'pdf',
        timestamp: new Date().toISOString(),
        url: response.data.url,
        success: true
      });

      return response.data;
    } catch (error) {
      setExportError(error.response?.data?.message || error.message);
      return null;
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export FAERS data to Word (DOCX)
   * 
   * @param {Object} faersData - FAERS data to export
   * @param {Object} options - Export options
   */
  const exportToWord = async (faersData, options = {}) => {
    if (!faersData) {
      setExportError('No FAERS data to export');
      return null;
    }

    setExporting(true);
    setExportError(null);

    try {
      const response = await axios.post('/api/cer/faers/export', {
        faersData,
        format: 'docx',
        options
      });

      setLastExport({
        format: 'docx',
        timestamp: new Date().toISOString(),
        url: response.data.url,
        success: true
      });

      return response.data;
    } catch (error) {
      setExportError(error.response?.data?.message || error.message);
      return null;
    } finally {
      setExporting(false);
    }
  };

  /**
   * Integrate FAERS data into CER
   * 
   * @param {Object} faersData - FAERS data to integrate
   * @param {string} cerId - CER ID to integrate data with
   * @param {Object} options - Integration options
   */
  const integrateWithCER = async (faersData, cerId, options = {}) => {
    if (!faersData || !cerId) {
      setExportError('FAERS data and CER ID are required');
      return null;
    }

    setExporting(true);
    setExportError(null);

    try {
      const response = await axios.post(`/api/cer/${cerId}/integrate-faers`, {
        faersData,
        options
      });

      setLastExport({
        format: 'cer',
        timestamp: new Date().toISOString(),
        cerId,
        success: true,
        message: response.data.message || 'FAERS data integrated successfully'
      });

      return response.data;
    } catch (error) {
      setExportError(error.response?.data?.message || error.message);
      return null;
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export FAERS data to any supported format
   * 
   * @param {Object} faersData - FAERS data to export
   * @param {string} format - Export format (pdf, docx, json, cer)
   * @param {Object} options - Export options
   * @param {string} cerId - CER ID (required for 'cer' format)
   */
  const exportFaersData = async (faersData, format = 'pdf', options = {}, cerId = null) => {
    if (format === 'pdf') {
      return exportToPDF(faersData, options);
    } else if (format === 'docx') {
      return exportToWord(faersData, options);
    } else if (format === 'cer') {
      return integrateWithCER(faersData, cerId, options);
    } else if (format === 'json') {
      // Handle JSON export (typically just returns the data)
      setLastExport({
        format: 'json',
        timestamp: new Date().toISOString(),
        success: true,
        data: faersData
      });
      return faersData;
    } else {
      setExportError(`Unsupported export format: ${format}`);
      return null;
    }
  };

  return {
    exportToPDF,
    exportToWord,
    integrateWithCER,
    exportFaersData,
    exporting,
    exportError,
    lastExport
  };
}
