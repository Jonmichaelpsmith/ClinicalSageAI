# eCTD Co-Author Module

## Overview

The eCTD Co-Author Module is a specialized document management and authoring environment designed specifically for creating and managing eCTD (Electronic Common Technical Document) submissions. This module provides advanced document editing capabilities, AI-assisted content generation, and comprehensive regulatory compliance checking.

## Architecture

The eCTD Co-Author Module integrates several key components:

1. **Enhanced Document Editor**: A versatile editing environment with support for:
   - Standard built-in text editor
   - Microsoft Word Online embedding via `Office365WordEmbed` (basic iframe)
   - AI-assisted content generation
   - Preview mode with formatting display

2. **Microsoft Office Integration**: Planned enterprise integration with Microsoft Word Online that will:
   - Connect to the VAULT Document Management system *(TODO)*
   - Provide a familiar Word editing experience via embed *(partial)*
   - Maintain all document versioning in VAULT *(TODO)*
   - Support Microsoft Copilot AI features *(in progress)*

3. **Document Intelligence Hub**: An AI-powered system that:
   - Analyzes document content
   - Generates regulatory-compliant suggestions
   - Checks for compliance with regulatory standards
   - Provides citation and reference management

## Feature Status

| Feature                      | Status       |
| ---------------------------- | ------------ |
| Word Online Embed            | **Implemented** (via `Office365WordEmbed`) |
| Word ↔ VAULT Sync            | **TODO** |
| Microsoft Copilot Services   | **Partial** (`msCopilotService` available) |
| Document Intelligence Hub    | **Implemented** |

## Microsoft Word Integration

The current implementation simply embeds Microsoft Word Online using an iframe. A future update will bridge Word Online with the VAULT Document Management system for seamless editing and version control.

### Key Components

- `Office365WordEmbed.jsx`: Basic Word Online embed component
- `msCopilotService.js`: Integrates Microsoft Copilot AI features for document authoring
- `EnhancedDocumentEditor.jsx`: Wrapper component that provides a unified editing experience
- `googleDocsService.js`: Allows saving documents to VAULT (current sync method)

### Implementation Details

1. **Authentication Flow**:
   - Users authenticate with their Microsoft account
   - Our system verifies Microsoft 365 access and capabilities
   - Server-side token exchange handles secure document access

2. **Document Editing Flow**:
   - Document is currently loaded from local state or Google Docs
   - Microsoft Word Online displays the document in a secure iframe
   - VAULT synchronization is not yet automated *(TODO)*
   - Planned versioning and audit trail will be handled in VAULT

3. **Microsoft Copilot Integration**:
   - `msCopilotService` provides API calls to our backend
   - GPT-4o integration (latest model released May 13, 2024)
   - Specialized regulatory knowledge enhances suggestions
   - Contextual awareness of document structure and purpose
   - Citation and reference management automation

## Best Practices

1. **Security**:
   - All document editing occurs within secure sessions
   - OAuth 2.0 authentication with appropriate scopes
   - No document content stored outside of VAULT
   - Session-based access tokens with limited lifetime

2. **Performance**:
   - Lazy-loading of Microsoft Word components
   - Optimized document loading and saving
   - Background synchronization for large documents
   - Efficient handling of document resources

3. **User Experience**:
   - Seamless switching between editing modes
   - Consistent UI across different editing environments
   - Clear status indicators for document state
   - Helpful error messages and recovery options

4. **Stability**:
   - Graceful degradation if Microsoft services unavailable
   - Local backup of changes during editing
   - Automatic recovery from connection issues
   - Comprehensive error logging and monitoring

## Environment Variables

The Microsoft Word integration requires the following environment variables:

```
VITE_MS_CLIENT_ID=your-microsoft-client-id
VITE_MS_AUTHORITY=https://login.microsoftonline.com/common
VITE_MS_GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
VITE_MS_COPILOT_ENABLED=true
VITE_MS_COPILOT_API_ENDPOINT=https://api.ms-copilot.com
```

## Common Issues and Troubleshooting

1. **Authentication Failures**:
   - Verify Microsoft 365 account has appropriate licenses
   - Check client ID and authority configuration
   - Ensure proper OAuth scopes are requested

2. **Document Loading Issues**:
   - Verify VAULT document access permissions
   - Check network connectivity to Microsoft services
   - Ensure document format is supported by Word Online

3. **Saving Failures**:
   - Check write permissions in VAULT
   - Verify authentication token hasn't expired
   - Ensure document isn't locked by another user

4. **Microsoft Copilot Issues**:
   - Verify license includes Copilot access
   - Check organization policies regarding AI features
   - Ensure connectivity to Copilot services

## Collaboration Components (New)

Recent tasks added real-time collaboration tools that can be used with the eCTD Co-Author:

- `hooks/useCollaboration.js` – React hook for connecting to the collaboration service
- `components/layout/OptimizedCollaborationLayout.jsx` – layout wrapper that loads the collaboration hub on demand
- `components/collaboration/ProjectCollaborationHub.jsx` and `components/collaboration/LazyCollaborationHub.jsx` – UI for messages, tasks and approvals
- `pages/CERV2PageWithCollaboration.jsx` – example page showing how to wrap an existing module

To enable these tools, wrap your page component with `OptimizedCollaborationLayout` and call the `useCollaboration` hook inside your page if you need access to collaboration state.

```jsx
import OptimizedCollaborationLayout from '@/components/layout/OptimizedCollaborationLayout';
import useCollaboration from '@/hooks/useCollaboration';

const CoAuthorWithCollab = () => {
  const collab = useCollaboration();

  return (
    <OptimizedCollaborationLayout>
      {/* Co-author UI here */}
    </OptimizedCollaborationLayout>
  );
};
```

## Future Enhancements

1. **Enhanced Collaboration**:
   - Real-time multi-user editing capabilities
   - Comment and annotation synchronization
   - Change tracking across platforms

2. **Advanced Regulatory Features**:
   - Automated regulatory submission checks
   - Agency-specific formatting tools
   - Pre-submission validation workflow

3. **Extended AI Integration**:
   - Domain-specific clinical writing assistance
   - Automated evidence linking and validation
   - Scientific literature integration and citation

## Maintenance Notes

The eCTD Co-Author Module is a critical component and should be maintained with care:

1. **Testing**: Any changes should undergo thorough testing, particularly around document saving and synchronization.

2. **Versioning**: All components are version-tracked and should maintain backward compatibility.

3. **Performance Monitoring**: Regular monitoring of response times and resource usage is essential.

4. **Security Updates**: Stay current with Microsoft API changes and security best practices.