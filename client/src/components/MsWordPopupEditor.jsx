import React, { useState } from 'react';
import Office365WordEmbed from './Office365WordEmbed';
import * as msCopilotService from '../services/msCopilotService';

/**
 * MsWordPopupEditor
 *
 * Displays a Microsoft Word Online iframe with an adjacent sidebar that can
 * fetch AI generated suggestions or compliance checks via msCopilotService.
 */
export default function MsWordPopupEditor({ documentId, documentUrl, onClose }) {
  const [sidebarContent, setSidebarContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await msCopilotService.getWritingSuggestions('');
      if (Array.isArray(suggestions)) {
        const text = suggestions
          .map((s, idx) =>
            typeof s === 'string'
              ? `${idx + 1}. ${s}`
              : `${idx + 1}. ${s.suggestion || s.text || ''}`
          )
          .join('\n');
        setSidebarContent(text);
      } else {
        setSidebarContent('No suggestions received');
      }
    } catch (err) {
      console.error('Failed to get suggestions', err);
      setSidebarContent('Error retrieving suggestions');
    } finally {
      setLoading(false);
    }
  };

  const runComplianceCheck = async () => {
    setLoading(true);
    try {
      const result = await msCopilotService.checkCompliance('', 'eCTD');
      const issues = result?.issues || [];
      const text = issues.length
        ? issues.map((i, idx) => `${idx + 1}. ${i.message || i}`).join('\n')
        : result?.compliant
        ? 'Document is compliant.'
        : 'No issues returned';
      setSidebarContent(text);
    } catch (err) {
      console.error('Failed to check compliance', err);
      setSidebarContent('Error checking compliance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <Office365WordEmbed documentId={documentId} documentUrl={documentUrl} />
      </div>
      <div className="w-80 border-l flex flex-col p-4 bg-white text-sm">
        <div className="flex space-x-2 mb-2">
          <button
            className="px-2 py-1 border rounded"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            Get Suggestions
          </button>
          <button
            className="px-2 py-1 border rounded"
            onClick={runComplianceCheck}
            disabled={loading}
          >
            Run Compliance
          </button>
        </div>
        <div className="flex-1 overflow-auto border rounded p-2 whitespace-pre-wrap">
          {loading ? 'Loading…' : sidebarContent || 'No AI content'}
        </div>
        {onClose && (
          <div className="mt-2 text-right">
            <button className="text-blue-600" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
