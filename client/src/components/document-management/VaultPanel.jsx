import React from 'react';
import DocuShareIntegration from './DocuShareIntegration';

/**
 * VaultPanel
 *
 * Lightweight wrapper around DocuShareIntegration to provide a
 * standardized document vault component across modules.
 */
export default function VaultPanel({
  moduleName = 'default',
  moduleLabel = 'Document Vault',
  compact = false,
  hidePreview = false,
  hideMetadata = false,
  includeGeneral = true,
  uploadEnabled = true,
  allowDelete = true,
  customFilters = null,
  className = ''
}) {
  return (
    <DocuShareIntegration
      moduleName={moduleName}
      moduleLabel={moduleLabel}
      includeGeneral={includeGeneral}
      compact={compact}
      hidePreview={hidePreview}
      hideMetadata={hideMetadata}
      uploadEnabled={uploadEnabled}
      allowDelete={allowDelete}
      customFilters={customFilters}
      className={className}
    />
  );
}
