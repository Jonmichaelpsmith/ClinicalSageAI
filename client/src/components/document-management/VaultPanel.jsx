import React from 'react';
import DocuShareIntegration from './DocuShareIntegration';
import DocumentVaultPanel from '../cer/DocumentVaultPanel';

/**
 * VaultPanel - unified interface for document management.
 *
 * Use `mode="vault"` to display the original DocumentVaultPanel
 * or `mode="docushare"` (default) for DocuShareIntegration.
 */
export default function VaultPanel({ mode = 'docushare', ...props }) {
  if (mode === 'vault') {
    return <DocumentVaultPanel {...props} />;
  }
  return <DocuShareIntegration {...props} />;
}
