/**
 * File Upload Wrapper Component
 * 
 * This is a stable wrapper around the FileUpload component to prevent version conflicts.
 * All components should import FileUpload from this wrapper instead of directly from
 * file-upload.jsx or file-upload.tsx to prevent compatibility issues.
 */

import React from 'react';
import { FileUpload as FileUploadTsx } from './file-upload';

// Export the component with a stable interface that won't change
export const FileUpload = (props) => {
  return <FileUploadTsx {...props} />;
};

// Also export as default for components that use default imports
export default FileUpload;